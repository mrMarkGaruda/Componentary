// MongoDB initialization script
// This script runs when the MongoDB container starts for the first time

// Switch to the componentary database
db = db.getSiblingDB('componentary');

// Create collections with indexes for better performance
// Ensure collections are created if they don't exist.
// Using createCollection is idempotent.
db.createCollection('users');
db.createCollection('products');
db.createCollection('orders');
db.createCollection('reviews'); // Added reviews collection from new data
db.createCollection('chats'); // Kept chats collection

// Drop existing sample data to avoid conflicts if script is re-run on a persistent volume
// For a clean seed, it might be better to drop collections or specific data
// However, for simplicity in this step, we'll rely on MongoDB's behavior with insertMany
// or ensure this script only truly runs "once" against a fresh DB.
// A more robust approach for development might involve checking if data exists or dropping.

// Create indexes for better query performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "username": 1 }, { unique: true }); // Added for new user schema
db.users.createIndex({ "createdAt": 1 });

db.products.createIndex({ "name": "text", "description": "text" });
db.products.createIndex({ "category": 1 });
db.products.createIndex({ "manufacturer": 1 }); // Added for new product schema
db.products.createIndex({ "modelNumber": 1 }); // Added for new product schema
db.products.createIndex({ "price": 1 });
db.products.createIndex({ "averageRating": -1 }); // Changed from 1 to -1 for descending sort
db.products.createIndex({ "seller": 1 }); // Added seller index
db.products.createIndex({ "createdAt": 1 });

db.orders.createIndex({ "user": 1 });
db.orders.createIndex({ "status": 1 });
db.orders.createIndex({ "createdAt": 1 });

db.reviews.createIndex({ "product": 1 }); // Assuming reviews are linked to products
db.reviews.createIndex({ "user": 1 });    // Assuming reviews are linked to users
db.reviews.createIndex({ "rating": 1 });
db.reviews.createIndex({ "createdAt": 1 });

db.chats.createIndex({ "participants": 1 });
db.chats.createIndex({ "lastMessage": 1 });

// Remove existing sample data to prevent duplication or conflicts
// This is a simple way for a seeding script.
// More sophisticated checks could be done (e.g., if collections are empty).
db.products.deleteMany({});
db.users.deleteMany({});
db.orders.deleteMany({}); // Also clear orders for a fresh start

// Sample Users
const usersToInsert = [
  {
    username: 'adminuser', // Added username
    name: 'Admin User',
    email: 'admin@componentary.com',
    password: 'adminpassword', // Plain text for seed, will be hashed by app
    role: 'admin',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    username: 'sellergiga', // Added username
    name: 'Gigabyte Seller',
    email: 'seller.giga@example.com',
    password: 'sellerpass', // Plain text for seed
    role: 'seller',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    username: 'customertom', // Added username
    name: 'Tom Customer',
    email: 'tom.customer@example.com',
    password: 'customerpass', // Plain text for seed
    role: 'customer',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

db.users.insertMany(usersToInsert);
const adminUser = db.users.findOne({ email: 'admin@componentary.com' });
const sellerGiga = db.users.findOne({ email: 'seller.giga@example.com' });

// PC Component Products
const productsToInsert = [
  // CPUs
  {
    name: 'Intel Core i9-13900K Processor',
    description: '24 Cores (8P + 16E) & 32 Threads, up to 5.8 GHz, LGA1700 Socket, Unlocked.',
    price: 589.99,
    image: 'https://c1.neweggimages.com/ProductImageCompressAll1280/19-118-412-V01.jpg',
    category: 'CPU',
    manufacturer: 'Intel',
    modelNumber: 'BX8071513900K',
    specifications: { cores: 24, threads: 32, clockSpeed: "5.8GHz", socket: "LGA1700" },
    tags: ['cpu', 'intel', 'i9', 'gaming', 'lga1700'],
    stock: 50,
    seller: adminUser._id,
    ratings: [],
    averageRating: 0,
    totalRatings: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'AMD Ryzen 9 7950X Processor',
    description: '16 Cores & 32 Threads, up to 5.7 GHz, AM5 Socket, Unlocked.',
    price: 549.00,
    image: 'https://c1.neweggimages.com/ProductImageCompressAll1280/19-113-771-V01.jpg',
    category: 'CPU',
    manufacturer: 'AMD',
    modelNumber: '100-100000514WOF',
    specifications: { cores: 16, threads: 32, clockSpeed: "5.7GHz", socket: "AM5" },
    tags: ['cpu', 'amd', 'ryzen 9', 'gaming', 'am5'],
    stock: 40,
    seller: sellerGiga._id,
    ratings: [],
    averageRating: 0,
    totalRatings: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  // GPUs
  {
    name: 'NVIDIA GeForce RTX 4090',
    description: '24GB GDDR6X, PCIe 4.0, Ultimate Gaming Performance.',
    price: 1599.99,
    image: 'https://c1.neweggimages.com/ProductImageCompressAll1280/14-126-593-01.png',
    category: 'GPU',
    manufacturer: 'NVIDIA',
    modelNumber: 'Founders Edition',
    specifications: { memory: "24GB GDDR6X", chipset: "GeForce RTX 4090", boostClock: "2.52GHz" },
    tags: ['gpu', 'nvidia', 'rtx 4090', 'gaming', 'ray tracing'],
    stock: 15,
    seller: adminUser._id,
    ratings: [],
    averageRating: 0,
    totalRatings: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'AMD Radeon RX 7900 XTX',
    description: '24GB GDDR6, RDNA 3 Architecture, High-end Gaming GPU.',
    price: 999.00,
    image: 'https://c1.neweggimages.com/ProductImageCompressAll1280/14-202-428-01.jpg',
    category: 'GPU',
    manufacturer: 'AMD',
    modelNumber: 'RX 7900 XTX',
    specifications: { memory: "24GB GDDR6", chipset: "Radeon RX 7900 XTX", boostClock: "2.5GHz" },
    tags: ['gpu', 'amd', 'rx 7900 xtx', 'gaming', 'rdna 3'],
    stock: 25,
    seller: sellerGiga._id,
    ratings: [],
    averageRating: 0,
    totalRatings: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  // Motherboards
  {
    name: 'ASUS ROG Strix Z790-E Gaming WiFi',
    description: 'LGA1700 Socket, DDR5, PCIe 5.0, WiFi 6E, ATX Motherboard for Intel 13th Gen.',
    price: 499.99,
    image: 'https://c1.neweggimages.com/ProductImageCompressAll1280/13-119-600-01.jpg',
    category: 'Motherboard',
    manufacturer: 'ASUS',
    modelNumber: 'ROG STRIX Z790-E GAMING WIFI',
    specifications: { socket: "LGA1700", chipset: "Z790", formFactor: "ATX", memoryType: "DDR5" },
    tags: ['motherboard', 'asus', 'rog strix', 'z790', 'lga1700', 'ddr5'],
    stock: 30,
    seller: adminUser._id,
    ratings: [],
    averageRating: 0,
    totalRatings: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Gigabyte X670 AORUS Elite AX',
    description: 'AM5 Socket, DDR5, PCIe 5.0, WiFi 6E, ATX Motherboard for AMD Ryzen 7000 Series.',
    price: 289.99,
    image: 'https://c1.neweggimages.com/ProductImageCompressAll1280/13-145-418-01.jpg',
    category: 'Motherboard',
    manufacturer: 'Gigabyte',
    modelNumber: 'X670 AORUS ELITE AX (rev. 1.0)',
    specifications: { socket: "AM5", chipset: "X670", formFactor: "ATX", memoryType: "DDR5" },
    tags: ['motherboard', 'gigabyte', 'aorus', 'x670', 'am5', 'ddr5'],
    stock: 35,
    seller: sellerGiga._id,
    ratings: [],
    averageRating: 0,
    totalRatings: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  // RAM
  {
    name: 'Corsair Vengeance LPX 32GB (2x16GB) DDR4 3200MHz',
    description: 'High-performance DDR4 memory kit for Intel and AMD motherboards.',
    price: 94.99,
    image: 'https://c1.neweggimages.com/ProductImageCompressAll1280/20-236-541-01.jpg',
    category: 'RAM',
    manufacturer: 'Corsair',
    modelNumber: 'CMK32GX4M2E3200C16',
    specifications: { capacity: "32GB", type: "DDR4", speed: "3200MHz", modules: "2x16GB" },
    tags: ['ram', 'corsair', 'ddr4', '32gb', 'memory'],
    stock: 100,
    seller: adminUser._id,
    ratings: [],
    averageRating: 0,
    totalRatings: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'G.Skill Trident Z5 RGB 32GB (2x16GB) DDR5 6000MHz',
    description: 'Extreme performance DDR5 memory with RGB lighting.',
    price: 149.99,
    image: 'https://c1.neweggimages.com/ProductImageCompressAll1280/20-374-351-01.jpg',
    category: 'RAM',
    manufacturer: 'G.Skill',
    modelNumber: 'F5-6000J3636F16GX2-TZ5RK',
    specifications: { capacity: "32GB", type: "DDR5", speed: "6000MHz", modules: "2x16GB", casLatency: "CL36" },
    tags: ['ram', 'g.skill', 'trident z5', 'ddr5', '32gb', 'rgb'],
    stock: 70,
    seller: sellerGiga._id,
    ratings: [],
    averageRating: 0,
    totalRatings: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  // Storage
  {
    name: 'Samsung 980 Pro 2TB NVMe SSD',
    description: 'PCIe 4.0 NVMe M.2 SSD for high-speed storage and gaming.',
    price: 169.99,
    image: 'https://c1.neweggimages.com/ProductImageCompressAll1280/20-147-796-01.jpg',
    category: 'Storage',
    manufacturer: 'Samsung',
    modelNumber: 'MZ-V8P2T0B/AM',
    specifications: { capacity: "2TB", type: "NVMe SSD", interface: "PCIe 4.0 M.2", readSpeed: "7000MB/s" },
    tags: ['ssd', 'samsung', '980 pro', 'nvme', '2tb', 'storage'],
    stock: 80,
    seller: adminUser._id,
    ratings: [],
    averageRating: 0,
    totalRatings: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Western Digital Black SN850X 4TB NVMe SSD',
    description: 'High-performance NVMe M.2 SSD with Heatsink, ideal for gaming and content creation.',
    price: 329.99,
    image: 'https://c1.neweggimages.com/ProductImageCompressAll1280/20-250-213-01.jpg',
    category: 'Storage',
    manufacturer: 'Western Digital',
    modelNumber: 'WDS400T2XHE',
    specifications: { capacity: "4TB", type: "NVMe SSD", interface: "PCIe 4.0 M.2", readSpeed: "7300MB/s", heatsink: true },
    tags: ['ssd', 'wd black', 'sn850x', 'nvme', '4tb', 'gaming', 'heatsink'],
    stock: 45,
    seller: sellerGiga._id,
    ratings: [],
    averageRating: 0,
    totalRatings: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  // PSUs
  {
    name: 'Corsair RM850x (2021) 850W 80+ Gold PSU',
    description: 'Fully modular power supply with quiet operation and reliable performance.',
    price: 134.99,
    image: 'https://c1.neweggimages.com/ProductImageCompressAll1280/17-139-269-01.jpg',
    category: 'PSU',
    manufacturer: 'Corsair',
    modelNumber: 'CP-9020200-NA',
    specifications: { wattage: "850W", efficiency: "80+ Gold", modularity: "Fully Modular" },
    tags: ['psu', 'corsair', '850w', 'gold', 'modular'],
    stock: 60,
    seller: adminUser._id,
    ratings: [],
    averageRating: 0,
    totalRatings: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Seasonic FOCUS PX-750, 750W 80+ Platinum PSU',
    description: 'High-efficiency, fully modular power supply for demanding systems.',
    price: 159.99,
    image: 'https://c1.neweggimages.com/ProductImageCompressAll1280/17-151-230-01.jpg',
    category: 'PSU',
    manufacturer: 'Seasonic',
    modelNumber: 'SSR-750PX',
    specifications: { wattage: "750W", efficiency: "80+ Platinum", modularity: "Fully Modular" },
    tags: ['psu', 'seasonic', '750w', 'platinum', 'modular'],
    stock: 40,
    seller: sellerGiga._id,
    ratings: [],
    averageRating: 0,
    totalRatings: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  // Cases
  {
    name: 'NZXT H510 Flow Mid-Tower Case',
    description: 'Compact ATX mid-tower case with excellent airflow and tempered glass side panel.',
    price: 89.99,
    image: 'https://c1.neweggimages.com/ProductImageCompressAll1280/11-146-330-V01.jpg',
    category: 'Case',
    manufacturer: 'NZXT',
    modelNumber: 'CA-H52FW-01', // White version
    specifications: { type: "Mid-Tower", formFactor: "ATX", color: "White", sidePanel: "Tempered Glass" },
    tags: ['case', 'nzxt', 'h510 flow', 'mid-tower', 'atx', 'airflow'],
    stock: 55,
    seller: adminUser._id,
    ratings: [],
    averageRating: 0,
    totalRatings: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Lian Li PC-O11 Dynamic EVO Black',
    description: 'Mid-tower chassis with dual chamber design, supports multiple radiator configurations.',
    price: 169.99,
    image: 'https://c1.neweggimages.com/ProductImageCompressAll1280/11-112-632-01.jpg',
    category: 'Case',
    manufacturer: 'Lian Li',
    modelNumber: 'O11DEW', // Assuming white, check model for black
    specifications: { type: "Mid-Tower", formFactor: "ATX, E-ATX", color: "Black", sidePanel: "Tempered Glass" },
    tags: ['case', 'lian li', 'o11 dynamic', 'mid-tower', 'water cooling'],
    stock: 30,
    seller: sellerGiga._id,
    ratings: [],
    averageRating: 0,
    totalRatings: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  // Cooling
  {
    name: 'Noctua NH-D15 chromax.black CPU Cooler',
    description: 'Dual-tower CPU cooler with exceptional performance and quiet operation, all black design.',
    price: 109.95,
    image: 'https://c1.neweggimages.com/ProductImageCompressAll1280/35-608-120-V01.jpg',
    category: 'Cooling',
    manufacturer: 'Noctua',
    modelNumber: 'NH-D15 chromax.black',
    specifications: { type: "Air Cooler", fanSize: "140mm", color: "Black", compatibility: "Intel/AMD" },
    tags: ['cooling', 'noctua', 'nh-d15', 'air cooler', 'cpu cooler', 'chromax'],
    stock: 40,
    seller: adminUser._id,
    ratings: [],
    averageRating: 0,
    totalRatings: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Corsair iCUE H150i ELITE CAPELLIX XT Liquid CPU Cooler',
    description: '360mm AIO liquid cooler with RGB lighting and high-performance fans.',
    price: 189.99,
    image: 'https://c1.neweggimages.com/ProductImageCompressAll1280/35-181-300-01.jpg',
    category: 'Cooling',
    manufacturer: 'Corsair',
    modelNumber: 'CW-9060070-WW',
    specifications: { type: "Liquid Cooler", radiatorSize: "360mm", fanSize: "120mm", rgb: true },
    tags: ['cooling', 'corsair', 'aio', 'liquid cooler', '360mm', 'rgb'],
    stock: 25,
    seller: sellerGiga._id,
    ratings: [],
    averageRating: 0,
    totalRatings: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  // Monitors
  {
    name: 'LG UltraGear 27GP850-B 27" QHD Nano IPS Gaming Monitor',
    description: '27-inch QHD (2560x1440) Nano IPS display, 165Hz (O/C 180Hz), 1ms GtG, G-SYNC Compatible.',
    price: 379.99,
    image: 'https://c1.neweggimages.com/ProductImageCompressAll1280/24-026-070-V01.jpg',
    category: 'Monitor',
    manufacturer: 'LG',
    modelNumber: '27GP850-B',
    specifications: { size: "27 inch", resolution: "2560x1440", panelType: "Nano IPS", refreshRate: "165Hz", responseTime: "1ms" },
    tags: ['monitor', 'lg', 'ultragear', 'qhd', '165hz', 'gaming', 'ips'],
    stock: 30,
    seller: adminUser._id,
    ratings: [],
    averageRating: 0,
    totalRatings: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  // Keyboards
  {
    name: 'Logitech G Pro X Mechanical Gaming Keyboard',
    description: 'Tenkeyless design, swappable pro-grade GX switches, LIGHTSYNC RGB.',
    price: 129.99,
    image: 'https://c1.neweggimages.com/ProductImageCompressAll1280/23-126-529-01.jpg',
    category: 'Keyboard',
    manufacturer: 'Logitech',
    modelNumber: '920-009230', // GX Blue Clicky
    specifications: { type: "Mechanical", layout: "Tenkeyless", switches: "GX Blue Clicky", rgb: true },
    tags: ['keyboard', 'logitech', 'g pro x', 'mechanical', 'gaming', 'tkl', 'rgb'],
    stock: 50,
    seller: sellerGiga._id,
    ratings: [],
    averageRating: 0,
    totalRatings: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  // Mice
  {
    name: 'Razer DeathAdder V2 Pro Wireless Gaming Mouse',
    description: 'Ergonomic design, Focus+ 20K DPI optical sensor, HyperSpeed wireless, 8 programmable buttons.',
    price: 99.99,
    image: 'https://c1.neweggimages.com/ProductImageCompressAll1280/26-153-484-01.jpg',
    category: 'Mouse',
    manufacturer: 'Razer',
    modelNumber: 'RZ01-03350100-R3U1',
    specifications: { type: "Wireless", sensor: "Optical 20K DPI", buttons: 8, ergonomic: true },
    tags: ['mouse', 'razer', 'deathadder v2 pro', 'wireless', 'gaming', 'ergonomic'],
    stock: 60,
    seller: adminUser._id,
    ratings: [],
    averageRating: 0,
    totalRatings: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  // Prebuilt PC
  {
    name: 'Skytech Shiva Gaming PC',
    description: 'Prebuilt gaming PC with AMD Ryzen 5 5600X, NVIDIA RTX 3060 Ti, 16GB DDR4 RAM, 1TB NVMe SSD, Windows 11.',
    price: 1299.99,
    image: 'https://c1.neweggimages.com/ProductImageCompressAll1280/83-289-320-V01.jpg',
    category: 'Prebuilt',
    manufacturer: 'Skytech Gaming',
    modelNumber: 'ST-SHIVA-0296-B-AM',
    specifications: { cpu: "AMD Ryzen 5 5600X", gpu: "NVIDIA RTX 3060 Ti", ram: "16GB DDR4", storage: "1TB NVMe SSD", os: "Windows 11" },
    tags: ['prebuilt', 'gaming pc', 'skytech', 'ryzen', 'rtx 3060 ti'],
    stock: 10,
    seller: sellerGiga._id,
    ratings: [],
    averageRating: 0,
    totalRatings: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  // More CPUs
  {
    name: 'Intel Core i5-13600K Processor',
    description: '14 Cores (6P + 8E) & 20 Threads, up to 5.1 GHz, LGA1700 Socket, Unlocked.',
    price: 319.99,
    image: 'https://c1.neweggimages.com/ProductImageCompressAll1280/19-118-417-V01.jpg',
    category: 'CPU',
    manufacturer: 'Intel',
    modelNumber: 'BX8071513600K',
    specifications: { cores: 14, threads: 20, clockSpeed: "5.1GHz", socket: "LGA1700" },
    tags: ['cpu', 'intel', 'i5', 'gaming', 'lga1700'],
    stock: 60,
    seller: adminUser._id,
    ratings: [], averageRating: 0, totalRatings: 0, createdAt: new Date(), updatedAt: new Date()
  },
  {
    name: 'AMD Ryzen 7 7800X3D Processor',
    description: '8 Cores & 16 Threads, up to 5.0 GHz, AM5 Socket, 3D V-Cache for Gaming.',
    price: 449.00,
    image: 'https://c1.neweggimages.com/ProductImageCompressAll1280/19-113-792-01.jpg',
    category: 'CPU',
    manufacturer: 'AMD',
    modelNumber: '100-100000910WOF',
    specifications: { cores: 8, threads: 16, clockSpeed: "5.0GHz", socket: "AM5", cache: "96MB L3" },
    tags: ['cpu', 'amd', 'ryzen 7', 'gaming', 'am5', '3d v-cache'],
    stock: 30,
    seller: sellerGiga._id,
    ratings: [], averageRating: 0, totalRatings: 0, createdAt: new Date(), updatedAt: new Date()
  },
  // More GPUs
  {
    name: 'NVIDIA GeForce RTX 4070 Ti',
    description: '12GB GDDR6X, PCIe 4.0, Excellent 1440p Gaming Performance.',
    price: 799.99,
    image: 'https://c1.neweggimages.com/ProductImageCompressAll1280/14-126-608-V01.jpg', // ASUS TUF model
    category: 'GPU',
    manufacturer: 'NVIDIA', // Chipset manufacturer
    modelNumber: 'RTX 4070 Ti', // Generic model, specific AIBs vary
    specifications: { memory: "12GB GDDR6X", chipset: "GeForce RTX 4070 Ti", boostClock: "2.61GHz" },
    tags: ['gpu', 'nvidia', 'rtx 4070 ti', 'gaming', '1440p'],
    stock: 20,
    seller: adminUser._id,
    ratings: [], averageRating: 0, totalRatings: 0, createdAt: new Date(), updatedAt: new Date()
  },
  {
    name: 'AMD Radeon RX 6800 XT',
    description: '16GB GDDR6, RDNA 2 Architecture, Strong 1440p and 4K Gaming.',
    price: 529.99,
    image: 'https://c1.neweggimages.com/ProductImageCompressAll1280/14-126-459-V01.jpg', // ASUS TUF model
    category: 'GPU',
    manufacturer: 'AMD',
    modelNumber: 'RX 6800 XT',
    specifications: { memory: "16GB GDDR6", chipset: "Radeon RX 6800 XT", boostClock: "2.25GHz" },
    tags: ['gpu', 'amd', 'rx 6800 xt', 'gaming', 'rdna 2'],
    stock: 22,
    seller: sellerGiga._id,
    ratings: [], averageRating: 0, totalRatings: 0, createdAt: new Date(), updatedAt: new Date()
  },
  // More Motherboards
  {
    name: 'MSI MAG B650 TOMAHAWK WIFI',
    description: 'AM5 Socket, DDR5, PCIe 4.0, WiFi 6E, ATX Motherboard for AMD Ryzen 7000 Series.',
    price: 219.99,
    image: 'https://c1.neweggimages.com/ProductImageCompressAll1280/13-144-557-01.jpg',
    category: 'Motherboard',
    manufacturer: 'MSI',
    modelNumber: 'MAG B650 TOMAHAWK WIFI',
    specifications: { socket: "AM5", chipset: "B650", formFactor: "ATX", memoryType: "DDR5" },
    tags: ['motherboard', 'msi', 'tomahawk', 'b650', 'am5', 'ddr5', 'wifi'],
    stock: 40,
    seller: adminUser._id,
    ratings: [], averageRating: 0, totalRatings: 0, createdAt: new Date(), updatedAt: new Date()
  },
  // More RAM
  {
    name: 'Kingston FURY Beast RGB 32GB (2x16GB) DDR5 5200MHz',
    description: 'High-performance DDR5 memory with RGB lighting, optimized for Intel XMP 3.0.',
    price: 124.99,
    image: 'https://c1.neweggimages.com/ProductImageCompressAll1280/20-242-700-01.jpg',
    category: 'RAM',
    manufacturer: 'Kingston',
    modelNumber: 'KF552C40BBAK2-32',
    specifications: { capacity: "32GB", type: "DDR5", speed: "5200MHz", modules: "2x16GB", casLatency: "CL40" },
    tags: ['ram', 'kingston', 'fury beast', 'ddr5', '32gb', 'rgb'],
    stock: 65,
    seller: sellerGiga._id,
    ratings: [], averageRating: 0, totalRatings: 0, createdAt: new Date(), updatedAt: new Date()
  },
  // More Storage
  {
    name: 'Crucial P5 Plus 1TB NVMe SSD',
    description: 'PCIe 4.0 NVMe M.2 SSD, up to 6600MB/s read speed, for gaming and creative workloads.',
    price: 89.99,
    image: 'https://c1.neweggimages.com/ProductImageCompressAll1280/20-156-269-01.jpg',
    category: 'Storage',
    manufacturer: 'Crucial',
    modelNumber: 'CT1000P5PSSD8',
    specifications: { capacity: "1TB", type: "NVMe SSD", interface: "PCIe 4.0 M.2", readSpeed: "6600MB/s" },
    tags: ['ssd', 'crucial', 'p5 plus', 'nvme', '1tb', 'storage'],
    stock: 90,
    seller: adminUser._id,
    ratings: [], averageRating: 0, totalRatings: 0, createdAt: new Date(), updatedAt: new Date()
  },
  {
    name: 'Seagate BarraCuda 4TB Internal Hard Drive HDD',
    description: '3.5 Inch SATA 6Gb/s 5400 RPM 256MB Cache for Computer Desktop PC.',
    price: 79.99,
    image: 'https://c1.neweggimages.com/ProductImageCompressAll1280/22-184-795-01.jpg',
    category: 'Storage',
    manufacturer: 'Seagate',
    modelNumber: 'ST4000DM004',
    specifications: { capacity: "4TB", type: "HDD", interface: "SATA 6Gb/s", rpm: "5400", cache: "256MB" },
    tags: ['hdd', 'seagate', 'barracuda', '4tb', 'storage', 'desktop'],
    stock: 120,
    seller: sellerGiga._id,
    ratings: [], averageRating: 0, totalRatings: 0, createdAt: new Date(), updatedAt: new Date()
  },
  // More PSUs
  {
    name: 'EVGA SuperNOVA 1000 G6, 80 Plus Gold 1000W PSU',
    description: 'Fully Modular, Eco Mode with FDB Fan, 10 Year Warranty.',
    price: 209.99,
    image: 'https://c1.neweggimages.com/ProductImageCompressAll1280/17-438-213-01.jpg',
    category: 'PSU',
    manufacturer: 'EVGA',
    modelNumber: '220-G6-1000-X1',
    specifications: { wattage: "1000W", efficiency: "80+ Gold", modularity: "Fully Modular" },
    tags: ['psu', 'evga', 'supernova', '1000w', 'gold', 'modular'],
    stock: 30,
    seller: adminUser._id,
    ratings: [], averageRating: 0, totalRatings: 0, createdAt: new Date(), updatedAt: new Date()
  },
  // More Cases
  {
    name: 'Fractal Design Meshify 2 Compact Black',
    description: 'High-airflow ATX mid-tower case with iconic mesh front panel and tempered glass.',
    price: 109.99,
    image: 'https://c1.neweggimages.com/ProductImageCompressAll1280/11-352-139-V01.jpg',
    category: 'Case',
    manufacturer: 'Fractal Design',
    modelNumber: 'FD-C-MES2C-01',
    specifications: { type: "Mid-Tower", formFactor: "ATX", color: "Black", sidePanel: "Tempered Glass" },
    tags: ['case', 'fractal design', 'meshify 2', 'mid-tower', 'atx', 'airflow'],
    stock: 40,
    seller: sellerGiga._id,
    ratings: [], averageRating: 0, totalRatings: 0, createdAt: new Date(), updatedAt: new Date()
  },
  {
    name: 'Cooler Master MasterBox TD500 Mesh White',
    description: 'Mid-Tower ATX with Polygonal Mesh Front Panel, Crystalline Tempered Glass, Triple ARGB Fans.',
    price: 99.99,
    image: 'https://c1.neweggimages.com/ProductImageCompressAll1280/11-119-393-V01.jpg',
    category: 'Case',
    manufacturer: 'Cooler Master',
    modelNumber: 'MCB-D500D-WGNN-S01',
    specifications: { type: "Mid-Tower", formFactor: "ATX", color: "White", sidePanel: "Tempered Glass", fans: "3x ARGB" },
    tags: ['case', 'cooler master', 'td500 mesh', 'mid-tower', 'atx', 'argb'],
    stock: 33,
    seller: adminUser._id,
    ratings: [], averageRating: 0, totalRatings: 0, createdAt: new Date(), updatedAt: new Date()
  },
  // More Cooling
  {
    name: 'Arctic Liquid Freezer II 280 A-RGB',
    description: 'Multi Compatible All-in-One CPU Water Cooler with A-RGB, 280mm Radiator, 2x P14 PWM Fans.',
    price: 139.99,
    image: 'https://c1.neweggimages.com/ProductImageCompressAll1280/35-186-283-V01.jpg',
    category: 'Cooling',
    manufacturer: 'Arctic',
    modelNumber: 'ACFRE00106A',
    specifications: { type: "Liquid Cooler", radiatorSize: "280mm", fanSize: "140mm", rgb: true },
    tags: ['cooling', 'arctic', 'liquid freezer ii', 'aio', '280mm', 'rgb'],
    stock: 28,
    seller: sellerGiga._id,
    ratings: [], averageRating: 0, totalRatings: 0, createdAt: new Date(), updatedAt: new Date()
  },
  // More Monitors
  {
    name: 'Samsung Odyssey G7 32-Inch WQHD (2560x1440) Gaming Monitor',
    description: '32-inch 1000R Curved Screen, 240Hz, 1ms, G-Sync Compatible, HDR600.',
    price: 699.99,
    image: 'https://c1.neweggimages.com/ProductImageCompressAll1280/24-022-899-V01.jpg',
    category: 'Monitor',
    manufacturer: 'Samsung',
    modelNumber: 'LC32G75TQSNXZA',
    specifications: { size: "32 inch", resolution: "2560x1440", panelType: "VA", refreshRate: "240Hz", responseTime: "1ms", curve: "1000R" },
    tags: ['monitor', 'samsung', 'odyssey g7', 'qhd', '240hz', 'gaming', 'curved'],
    stock: 15,
    seller: adminUser._id,
    ratings: [], averageRating: 0, totalRatings: 0, createdAt: new Date(), updatedAt: new Date()
  },
  {
    name: 'Dell S2721DGF 27 Inch QHD (2560x1440) Gaming Monitor',
    description: 'IPS Panel, 165Hz, 1ms, AMD FreeSync Premium Pro, NVIDIA G-SYNC Compatible.',
    price: 329.99,
    image: 'https://c1.neweggimages.com/ProductImageCompressAll1280/24-260-646-V01.jpg',
    category: 'Monitor',
    manufacturer: 'Dell',
    modelNumber: 'S2721DGF',
    specifications: { size: "27 inch", resolution: "2560x1440", panelType: "IPS", refreshRate: "165Hz", responseTime: "1ms" },
    tags: ['monitor', 'dell', 'qhd', '165hz', 'gaming', 'ips'],
    stock: 25,
    seller: sellerGiga._id,
    ratings: [], averageRating: 0, totalRatings: 0, createdAt: new Date(), updatedAt: new Date()
  },
  // More Keyboards
  {
    name: 'Corsair K70 RGB MK.2 Mechanical Gaming Keyboard',
    description: 'Cherry MX Speed Switches, Aircraft-Grade Aluminum Frame, Dynamic Per-Key RGB Backlighting.',
    price: 159.99,
    image: 'https://c1.neweggimages.com/ProductImageCompressAll1280/23-816-101-V01.jpg',
    category: 'Keyboard',
    manufacturer: 'Corsair',
    modelNumber: 'CH-9109014-NA',
    specifications: { type: "Mechanical", layout: "Full Size", switches: "Cherry MX Speed", rgb: true },
    tags: ['keyboard', 'corsair', 'k70 mk.2', 'mechanical', 'gaming', 'rgb', 'cherry mx speed'],
    stock: 45,
    seller: adminUser._id,
    ratings: [], averageRating: 0, totalRatings: 0, createdAt: new Date(), updatedAt: new Date()
  },
  // More Mice
  {
    name: 'Logitech G502 HERO High Performance Wired Gaming Mouse',
    description: 'HERO 25K Sensor, 11 Programmable Buttons, Adjustable Weights, On-Board Memory, LIGHTSYNC RGB.',
    price: 49.99,
    image: 'https://c1.neweggimages.com/ProductImageCompressAll1280/26-197-339-V01.jpg',
    category: 'Mouse',
    manufacturer: 'Logitech',
    modelNumber: '910-005469',
    specifications: { type: "Wired", sensor: "HERO 25K", buttons: 11, rgb: true, weights: true },
    tags: ['mouse', 'logitech', 'g502 hero', 'wired', 'gaming', 'rgb'],
    stock: 70,
    seller: sellerGiga._id,
    ratings: [], averageRating: 0, totalRatings: 0, createdAt: new Date(), updatedAt: new Date()
  },
  // Audio - Headset
  {
    name: 'HyperX Cloud II Wireless Gaming Headset',
    description: '7.1 Surround Sound, Memory Foam Earcups, Detachable Noise-Cancelling Microphone, Up to 30 Hour Battery Life.',
    price: 149.99,
    image: 'https://c1.neweggimages.com/ProductImageCompressAll1280/26-197-001-01.jpg',
    category: 'Audio',
    manufacturer: 'HyperX',
    modelNumber: 'HHSC2X-BA-RD/G',
    specifications: { type: "Wireless Headset", sound: "7.1 Surround", microphone: "Detachable Noise-Cancelling", batteryLife: "30 hours" },
    tags: ['headset', 'hyperx', 'cloud ii', 'wireless', 'gaming', '7.1 surround'],
    stock: 35,
    seller: adminUser._id,
    ratings: [], averageRating: 0, totalRatings: 0, createdAt: new Date(), updatedAt: new Date()
  },
  // Networking - Router
  {
    name: 'ASUS RT-AX86U Pro (AX5700) WiFi 6 Gaming Router',
    description: 'Dual Band, Mobile Game Mode, Lifetime Free Internet Security, AURA RGB, 2.5G Port.',
    price: 279.99,
    image: 'https://c1.neweggimages.com/ProductImageCompressAll1280/33-320-520-01.jpg',
    category: 'Networking',
    manufacturer: 'ASUS',
    modelNumber: 'RT-AX86U Pro',
    specifications: { type: "WiFi 6 Router", speed: "AX5700", bands: "Dual Band", ports: "2.5G WAN/LAN" },
    tags: ['router', 'asus', 'wifi 6', 'gaming router', 'ax5700'],
    stock: 20,
    seller: sellerGiga._id,
    ratings: [], averageRating: 0, totalRatings: 0, createdAt: new Date(), updatedAt: new Date()
  }
];

db.products.insertMany(productsToInsert);
print(productsToInsert.length + ' sample PC component products inserted.');

// Example of creating a sample order (optional, can be expanded)
/*
const userJohn = db.users.findOne({ username: 'john_doe' });
const productLaptop = db.products.findOne({ name: 'Laptop Pro 15' });

if (userJohn && productLaptop) {
  const ordersToInsert = [
    {
      user: userJohn._id, // Link to user ID
      items: [
        {
          product: productLaptop._id, // Link to product ID
          name: productLaptop.name,
          quantity: 1,
          price: productLaptop.price,
          imageUrl: productLaptop.imageUrl
        }
      ],
      totalAmount: productLaptop.price,
      shippingAddress: userJohn.addresses.find(a => a.isDefault), // Use user's default address
      status: 'Pending', // Example status
      paymentDetails: {
        paymentMethod: 'Credit Card', // Example
        transactionId: 'txn_' + new Date().getTime() // Example transaction ID
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];
  db.orders.insertMany(ordersToInsert);
  print(ordersToInsert.length + ' sample order(s) inserted.');
}
*/

print('-----------------------------------------------------');
print('MongoDB initialization script completed.');
print('Database: ' + db.getName());
print('Collections created/verified: users, products, orders, reviews, chats.');
print('Indexes created.');
print('Sample data inserted for products and users.');
print('-----------------------------------------------------');