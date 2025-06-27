from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM
import uvicorn
import asyncio
from typing import Dict, Any
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="SmolLM2 AI Chat Service", version="1.0.0")

class ChatRequest(BaseModel):
    message: str
    context: Dict[str, Any] = {}
    seller_name: str = "Seller"
    product_info: Dict[str, Any] = {}

class ChatResponse(BaseModel):
    response: str
    confidence: float = 0.9

class SmolLM2ChatModel:
    def __init__(self):
        self.model = None
        self.tokenizer = None
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.max_length = 400  # Reduced for better context management
        self.temperature = 0.3  # Much lower for consistency
        
    async def load_model(self):
        """Load the SmolLM2-135M model from HuggingFace"""
        try:
            logger.info("Loading SmolLM2-135M model...")
            model_name = "HuggingFaceTB/SmolLM2-135M"
            
            self.tokenizer = AutoTokenizer.from_pretrained(model_name)
            self.model = AutoModelForCausalLM.from_pretrained(
                model_name,
                torch_dtype=torch.float16 if self.device == "cuda" else torch.float32,
                device_map="auto" if self.device == "cuda" else None,
                trust_remote_code=True
            )
            
            if self.tokenizer.pad_token is None:
                self.tokenizer.pad_token = self.tokenizer.eos_token
                
            logger.info(f"Model loaded successfully on {self.device}")
            return True
        except Exception as e:
            logger.error(f"Failed to load model: {e}")
            return False
    
    def create_context_prompt(self, message: str, product_info: Dict, seller_name: str) -> str:
        """Create a highly structured prompt for professional seller behavior"""
        
        # Start with clear role definition and constraints
        system_prompt = f"""You are {seller_name}, a professional customer service representative at Componentary, an e-commerce platform specializing in PC components and technology products.

STRICT GUIDELINES:
- Be helpful, professional, and knowledgeable
- Focus ONLY on product information, sales, and customer service
- Keep responses concise (1-2 sentences max)
- Do NOT go off-topic or discuss unrelated subjects
- Always stay in character as a seller
- Provide accurate information about products when available"""

        # Add product context if available
        product_context = ""
        if product_info:
            product_context = "\nCURRENT PRODUCT CONTEXT:\n"
            if product_info.get('name'):
                product_context += f"Product: {product_info['name']}\n"
            if product_info.get('price'):
                product_context += f"Price: ${product_info['price']}\n"
            if product_info.get('category'):
                product_context += f"Category: {product_info['category']}\n"
            if product_info.get('description'):
                desc = product_info['description'][:150] + "..." if len(product_info['description']) > 150 else product_info['description']
                product_context += f"Description: {desc}\n"
            if product_info.get('stock') is not None:
                stock_status = "Available" if product_info['stock'] > 0 else "Out of stock"
                product_context += f"Stock: {stock_status}\n"
        
        # Create the conversation format
        conversation = f"""
{system_prompt}{product_context}

Customer: {message}
{seller_name}: """
        
        return conversation
    
    async def generate_response(self, message: str, product_info: Dict, seller_name: str) -> str:
        """Generate AI response using SmolLM2 model with strict controls"""
        try:
            if not self.model or not self.tokenizer:
                return self._fallback_response(message, product_info)
            
            # Create highly structured prompt
            prompt = self.create_context_prompt(message, product_info, seller_name)
            
            # Tokenize input with careful length management
            inputs = self.tokenizer(
                prompt, 
                return_tensors="pt", 
                max_length=400,  # Reduced to keep context focused
                truncation=True,
                padding=True
            )
            inputs = {k: v.to(self.device) for k, v in inputs.items()}
            
            # Generate response with strict parameters
            with torch.no_grad():
                outputs = self.model.generate(
                    **inputs,
                    max_new_tokens=50,  # Much shorter responses
                    temperature=0.3,    # Much lower temperature for consistency
                    do_sample=True,
                    pad_token_id=self.tokenizer.pad_token_id,
                    eos_token_id=self.tokenizer.eos_token_id,
                    top_p=0.7,         # Lower top_p for more focused responses
                    repetition_penalty=1.3,  # Higher repetition penalty
                    no_repeat_ngram_size=2,
                    early_stopping=True
                )
            
            # Decode and extract response
            full_response = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
            logger.debug(f"Full model response: {full_response}")
            
            # Extract only the AI response part
            if f"{seller_name}:" in full_response:
                response = full_response.split(f"{seller_name}:")[-1].strip()
            else:
                # Fallback extraction
                response = full_response[len(prompt):].strip()
            
            logger.debug(f"Extracted response: {response}")
            
            # Strict response cleaning
            response = self._clean_response_strict(response)
            logger.debug(f"Cleaned response: {response}")
            
            # Validate response quality
            if not self._is_valid_response(response, message):
                logger.info(f"Generated response failed validation, using fallback")
                return self._fallback_response(message, product_info)
                
            return response if response else self._fallback_response(message, product_info)
            
        except Exception as e:
            logger.error(f"Error generating response: {e}")
            return self._fallback_response(message, product_info)
    
    def _clean_response_strict(self, response: str) -> str:
        """Strictly clean and format the AI response"""
        if not response:
            return ""
            
        # Remove any unwanted tokens or artifacts
        response = response.strip()
        
        # Remove any incomplete sentences or weird artifacts
        lines = response.split('\n')
        cleaned_lines = []
        
        for line in lines:
            line = line.strip()
            if line and not line.startswith(('Customer:', 'User:', 'Human:')):
                # Stop at any role indicators that might leak through
                if ':' in line and any(role in line.lower() for role in ['customer', 'user', 'human', 'assistant']):
                    break
                cleaned_lines.append(line)
        
        response = ' '.join(cleaned_lines).strip()
        
        # Ensure it's a complete sentence
        if response:
            # Take only the first complete sentence or two
            sentences = []
            current_sentence = ""
            
            for char in response:
                current_sentence += char
                if char in '.!?':
                    sentences.append(current_sentence.strip())
                    current_sentence = ""
                    if len(sentences) >= 2:  # Max 2 sentences
                        break
            
            # If we have incomplete sentence, add it if it's substantial
            if current_sentence.strip() and len(current_sentence.strip()) > 10:
                sentences.append(current_sentence.strip() + '.')
            
            response = ' '.join(sentences)
        
        # Final length check
        if len(response) > 200:
            response = response[:200].rsplit(' ', 1)[0] + '.'
            
        return response
    
    def _is_valid_response(self, response: str, original_message: str) -> bool:
        """Validate if the response is appropriate and on-topic"""
        if not response or len(response.strip()) < 5:
            return False
            
        response_lower = response.lower()
        
        # Check for inappropriate content or off-topic responses
        inappropriate_indicators = [
            'i am an ai', 'i am a language model', 'i cannot', 'i\'m sorry but',
            'as an ai', 'i don\'t have access', 'i can\'t browse', 'i\'m not able to',
            'my knowledge cutoff', 'training data', 'openai', 'chatgpt'
        ]
        
        for indicator in inappropriate_indicators:
            if indicator in response_lower:
                return False
        
        # Check if response is too repetitive
        words = response_lower.split()
        if len(words) > 3:
            unique_words = set(words)
            if len(unique_words) / len(words) < 0.6:  # Too repetitive
                return False
        
        return True
    
    def _fallback_response(self, message: str, product_info: Dict) -> str:
        """Professional fallback responses based on message context"""
        message_lower = message.lower().strip()
        
        # Greeting responses
        if any(word in message_lower for word in ['hello', 'hi', 'hey', 'good morning', 'good afternoon']):
            if product_info.get('name'):
                return f"Hello! I see you're interested in the {product_info['name']}. How can I help you with this product today?"
            return "Hello! Welcome to Componentary. How can I assist you with your tech needs today?"
        
        # Pricing inquiries
        if any(word in message_lower for word in ['price', 'cost', 'expensive', 'cheap', 'how much']):
            if product_info.get('price'):
                return f"This product is priced at ${product_info['price']}. It offers excellent value for its features. Would you like to know more about what's included?"
            return "I'd be happy to discuss pricing. Which specific product are you interested in?"
        
        # Stock/availability
        if any(word in message_lower for word in ['stock', 'available', 'in stock', 'out of stock']):
            if product_info.get('stock') is not None:
                stock = product_info['stock']
                if stock > 0:
                    return f"Good news! This item is currently in stock with {stock} units available. Would you like to place an order?"
                else:
                    return "This item is currently out of stock. I can notify you when it becomes available again. Would you like me to do that?"
            return "Let me check our current inventory for you. Which product are you asking about?"
        
        # Shipping inquiries
        if any(word in message_lower for word in ['shipping', 'delivery', 'ship', 'when will it arrive']):
            return "We offer fast shipping! Most orders ship within 1-2 business days and arrive within 2-5 business days. Free shipping is available on orders over $50."
        
        # Product quality/specifications
        if any(word in message_lower for word in ['quality', 'good', 'best', 'spec', 'feature']):
            if product_info.get('name'):
                return f"The {product_info['name']} is a high-quality product. Would you like me to explain its key features and specifications?"
            return "All our products are carefully selected for quality. What specific features are you looking for?"
        
        # Returns/warranty
        if any(word in message_lower for word in ['return', 'refund', 'warranty', 'guarantee']):
            return "We offer a 30-day return policy and full manufacturer warranty on all products. Your satisfaction is guaranteed!"
        
        # Comparison questions
        if any(word in message_lower for word in ['compare', 'difference', 'better', 'versus', 'vs']):
            return "I'd be happy to help you compare products. What specific items are you considering, and what features matter most to you?"
        
        # Thank you responses
        if any(word in message_lower for word in ['thank', 'thanks']):
            return "You're very welcome! Is there anything else I can help you with today?"
        
        # Default professional response
        if product_info.get('name'):
            return f"Thanks for your interest in the {product_info['name']}! How can I help you learn more about this product?"
        
        return "Thank you for contacting Componentary! I'm here to help with any questions about our tech products. What can I assist you with?"

# Initialize the model
chat_model = SmolLM2ChatModel()

@app.on_event("startup")
async def startup_event():
    """Load the model on startup"""
    success = await chat_model.load_model()
    if not success:
        logger.warning("Model failed to load, using fallback responses")

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """Chat endpoint for generating AI responses"""
    try:
        response = await chat_model.generate_response(
            request.message,
            request.product_info,
            request.seller_name
        )
        
        return ChatResponse(response=response, confidence=0.9)
    
    except Exception as e:
        logger.error(f"Chat endpoint error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "model_loaded": chat_model.model is not None}

@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "SmolLM2 AI Chat Service", "version": "1.0.0", "model": "HuggingFaceTB/SmolLM2-135M"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
