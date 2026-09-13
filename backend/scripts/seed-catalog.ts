import "dotenv/config";
import prisma from "../src/lib/prisma.js";

function placeholderImage(text: string, bg: string) {
  return `https://placehold.co/600x600/${bg}/ffffff?text=${encodeURIComponent(
    text.replace(/\+/g, " ")
  )}&font=roboto`;
}

interface SeedProduct {
  name: string;
  sku: string;
  description: string;
  price: number;
  costPrice: number;
  quantity: number;
  minStock: number;
  imageText: string;
}

interface SeedCategory {
  name: string;
  description: string;
  color: string;
  products: SeedProduct[];
}

const CATALOG: SeedCategory[] = [
  {
    name: "Electronics",
    description: "Development boards, audio, and computer accessories",
    color: "1a73e8",
    products: [
      {
        name: "Wireless Bluetooth Earbuds with ANC",
        sku: "WLS-EARBUD-ANC",
        description:
          "True wireless earbuds with active noise cancellation, 30 hours total battery life, and touch controls.",
        price: 2499,
        costPrice: 1600,
        quantity: 50,
        minStock: 10,
        imageText: "Earbuds",
      },
      {
        name: "27-inch 4K UHD Monitor",
        sku: "MON-27-4K",
        description:
          "27-inch IPS 4K UHD monitor with HDR support, 99% sRGB color accuracy, and dual HDMI/DisplayPort inputs.",
        price: 21999,
        costPrice: 17000,
        quantity: 15,
        minStock: 5,
        imageText: "4K+Monitor",
      },
      {
        name: "Portable Bluetooth Speaker 20W",
        sku: "SPK-BT-20W",
        description:
          "20W portable Bluetooth speaker with deep bass, 12-hour battery, and IPX7 waterproof rating.",
        price: 1799,
        costPrice: 1100,
        quantity: 40,
        minStock: 10,
        imageText: "BT+Speaker",
      },
    ],
  },
  {
    name: "Mobiles & Accessories",
    description: "Smartphones, chargers, and mobile accessories",
    color: "6c63ff",
    products: [
      {
        name: '6.5" Smartphone 128GB Triple Camera',
        sku: "PHN-128-TRI",
        description:
          "6.5-inch FHD+ display smartphone with 128GB storage, triple rear camera, and 5000mAh battery.",
        price: 14999,
        costPrice: 12000,
        quantity: 25,
        minStock: 5,
        imageText: "Smartphone",
      },
      {
        name: "Fast Charging Power Bank 20000mAh",
        sku: "PWRBNK-20K",
        description:
          "20000mAh power bank with 22.5W fast charging, dual USB output, and digital charge display.",
        price: 1499,
        costPrice: 950,
        quantity: 60,
        minStock: 15,
        imageText: "Power+Bank",
      },
      {
        name: "Tempered Glass Screen Protector (Pack of 2)",
        sku: "SCRPROT-2PK",
        description:
          "9H hardness tempered glass screen protector, anti-scratch and bubble-free installation, pack of 2.",
        price: 299,
        costPrice: 120,
        quantity: 100,
        minStock: 20,
        imageText: "Screen+Guard",
      },
      {
        name: "USB-C Fast Charging Cable 1.5m",
        sku: "USBC-CBL-1.5M",
        description:
          "1.5m braided USB-C fast charging cable rated for 60W, compatible with most modern devices.",
        price: 349,
        costPrice: 150,
        quantity: 80,
        minStock: 20,
        imageText: "USB-C+Cable",
      },
    ],
  },
  {
    name: "Fashion",
    description: "Clothing, footwear, and watches",
    color: "e91e63",
    products: [
      {
        name: "Men's Cotton Casual Shirt",
        sku: "SHIRT-MEN-COT",
        description:
          "100% cotton regular-fit casual shirt, machine washable, available in classic solid colors.",
        price: 899,
        costPrice: 450,
        quantity: 45,
        minStock: 10,
        imageText: "Men's+Shirt",
      },
      {
        name: "Women's Printed A-Line Kurta",
        sku: "KURTA-WMN-AL",
        description:
          "Printed A-line kurta in breathable rayon fabric, three-quarter sleeves, everyday wear.",
        price: 799,
        costPrice: 400,
        quantity: 40,
        minStock: 10,
        imageText: "Women's+Kurta",
      },
      {
        name: "Unisex Running Shoes",
        sku: "SHOES-RUN-UNI",
        description:
          "Lightweight mesh running shoes with cushioned sole and breathable design for daily runs.",
        price: 2199,
        costPrice: 1300,
        quantity: 35,
        minStock: 10,
        imageText: "Running+Shoes",
      },
      {
        name: "Leather Analog Wrist Watch",
        sku: "WATCH-LTHR-AN",
        description:
          "Analog wrist watch with genuine leather strap, water-resistant case, and scratch-resistant dial.",
        price: 1599,
        costPrice: 900,
        quantity: 30,
        minStock: 10,
        imageText: "Wrist+Watch",
      },
    ],
  },
  {
    name: "Home & Kitchen",
    description: "Cookware, storage, and home essentials",
    color: "00897b",
    products: [
      {
        name: "Non-Stick Cookware Set, 5 Pieces",
        sku: "COOKWARE-5PC",
        description:
          "5-piece non-stick cookware set including tawa, kadai, and saucepans with heat-resistant handles.",
        price: 2499,
        costPrice: 1600,
        quantity: 20,
        minStock: 5,
        imageText: "Cookware+Set",
      },
      {
        name: "Stainless Steel Vacuum Flask 1L",
        sku: "FLASK-SS-1L",
        description:
          "1-litre double-wall stainless steel vacuum flask, keeps beverages hot or cold for up to 12 hours.",
        price: 649,
        costPrice: 350,
        quantity: 50,
        minStock: 10,
        imageText: "Vacuum+Flask",
      },
      {
        name: "LED Table Lamp with USB Charging",
        sku: "LAMP-LED-USB",
        description:
          "Dimmable LED table lamp with built-in USB charging port and touch-sensitive brightness control.",
        price: 899,
        costPrice: 500,
        quantity: 30,
        minStock: 10,
        imageText: "Table+Lamp",
      },
      {
        name: "Memory Foam Pillow, Set of 2",
        sku: "PILLOW-MF-2PK",
        description:
          "Set of 2 memory foam pillows with breathable washable cover, ideal for neck and back support.",
        price: 1199,
        costPrice: 700,
        quantity: 40,
        minStock: 10,
        imageText: "Foam+Pillow",
      },
    ],
  },
  {
    name: "Beauty & Personal Care",
    description: "Skincare, grooming, and personal care essentials",
    color: "d81b60",
    products: [
      {
        name: "Vitamin C Face Serum 30ml",
        sku: "SERUM-VITC-30",
        description:
          "Brightening vitamin C face serum with hyaluronic acid, suitable for all skin types, 30ml bottle.",
        price: 549,
        costPrice: 250,
        quantity: 60,
        minStock: 15,
        imageText: "Face+Serum",
      },
      {
        name: "Electric Trimmer for Men",
        sku: "TRIMMER-MEN-EL",
        description:
          "Cordless electric trimmer with 20 length settings, 90-minute runtime, and washable blade.",
        price: 999,
        costPrice: 600,
        quantity: 35,
        minStock: 10,
        imageText: "Trimmer",
      },
      {
        name: "Herbal Shampoo 340ml",
        sku: "SHAMPOO-HRB-340",
        description:
          "Sulfate-free herbal shampoo with amla and bhringraj extracts for stronger, healthier hair.",
        price: 299,
        costPrice: 150,
        quantity: 70,
        minStock: 15,
        imageText: "Shampoo",
      },
    ],
  },
  {
    name: "Books",
    description: "Fiction, non-fiction, and children's books",
    color: "6d4c41",
    products: [
      {
        name: "The Art of Clean Code (Paperback)",
        sku: "BOOK-CLEANCODE",
        description:
          "A practical guide to writing maintainable, readable software, with real-world examples.",
        price: 449,
        costPrice: 280,
        quantity: 25,
        minStock: 5,
        imageText: "Clean+Code",
      },
      {
        name: "Atomic Habits (Paperback)",
        sku: "BOOK-ATOMICHAB",
        description:
          "A bestselling guide to building good habits and breaking bad ones, one small change at a time.",
        price: 399,
        costPrice: 250,
        quantity: 40,
        minStock: 10,
        imageText: "Atomic+Habits",
      },
      {
        name: "Children's Illustrated Story Book Set",
        sku: "BOOK-KIDS-SET",
        description:
          "A set of colorfully illustrated short stories for early readers, ages 4 and up.",
        price: 599,
        costPrice: 350,
        quantity: 20,
        minStock: 5,
        imageText: "Story+Books",
      },
    ],
  },
  {
    name: "Sports & Fitness",
    description: "Fitness equipment and outdoor gear",
    color: "43a047",
    products: [
      {
        name: "Yoga Mat with Carry Strap",
        sku: "YOGA-MAT-STR",
        description:
          "6mm thick non-slip yoga mat with carry strap, lightweight and easy to clean.",
        price: 699,
        costPrice: 350,
        quantity: 45,
        minStock: 10,
        imageText: "Yoga+Mat",
      },
      {
        name: "Adjustable Dumbbell Set 10kg",
        sku: "DUMBBELL-10KG",
        description:
          "Pair of adjustable dumbbells, 10kg total, with quick-change weight plates for home workouts.",
        price: 1899,
        costPrice: 1300,
        quantity: 15,
        minStock: 5,
        imageText: "Dumbbells",
      },
      {
        name: "Resistance Bands Set (5 Pieces)",
        sku: "RESIST-BAND-5PC",
        description:
          "Set of 5 resistance bands with varying tension levels, includes carry bag and workout guide.",
        price: 499,
        costPrice: 250,
        quantity: 50,
        minStock: 10,
        imageText: "Resistance+Bands",
      },
    ],
  },
  {
    name: "Toys & Baby",
    description: "Toys and games for kids of all ages",
    color: "fb8c00",
    products: [
      {
        name: "Building Blocks Set, 100 Pieces",
        sku: "TOY-BLOCKS-100",
        description:
          "100-piece interlocking building block set, safe non-toxic plastic, ages 3 and up.",
        price: 799,
        costPrice: 450,
        quantity: 30,
        minStock: 5,
        imageText: "Building+Blocks",
      },
      {
        name: "Remote Control Car",
        sku: "TOY-RC-CAR",
        description:
          "High-speed remote control car with rechargeable battery and off-road tires, ages 6 and up.",
        price: 1299,
        costPrice: 800,
        quantity: 25,
        minStock: 5,
        imageText: "RC+Car",
      },
      {
        name: "Soft Plush Teddy Bear 2ft",
        sku: "TOY-TEDDY-2FT",
        description:
          "2-foot tall soft plush teddy bear, hypoallergenic filling, machine washable cover.",
        price: 899,
        costPrice: 500,
        quantity: 20,
        minStock: 5,
        imageText: "Teddy+Bear",
      },
    ],
  },
  {
    name: "Grocery",
    description: "Everyday groceries and gourmet foods",
    color: "8d6e63",
    products: [
      {
        name: "Assorted Dry Fruits Gift Box 500g",
        sku: "GROC-DRYFRUIT-500",
        description:
          "Premium assorted dry fruits gift box with almonds, cashews, raisins, and pistachios, 500g.",
        price: 649,
        costPrice: 400,
        quantity: 40,
        minStock: 10,
        imageText: "Dry+Fruits",
      },
      {
        name: "Organic Honey 500g",
        sku: "GROC-HONEY-500",
        description:
          "100% pure and organic honey, unprocessed and unfiltered, sourced from natural forests.",
        price: 349,
        costPrice: 200,
        quantity: 50,
        minStock: 10,
        imageText: "Organic+Honey",
      },
      {
        name: "Premium Basmati Rice 5kg",
        sku: "GROC-RICE-5KG",
        description:
          "Aged premium basmati rice with long grains and rich aroma, 5kg pack.",
        price: 599,
        costPrice: 400,
        quantity: 35,
        minStock: 10,
        imageText: "Basmati+Rice",
      },
    ],
  },
];

async function main() {
  for (const category of CATALOG) {
    const categoryRow = await prisma.category.upsert({
      where: { name: category.name },
      update: { description: category.description },
      create: {
        name: category.name,
        description: category.description,
      },
    });

    for (const product of category.products) {
      const existing = await prisma.product.findUnique({
        where: { sku: product.sku },
      });

      if (existing) {
        await prisma.product.update({
          where: { sku: product.sku },
          data: {
            name: product.name,
            description: product.description,
            price: product.price,
            costPrice: product.costPrice,
            categoryId: categoryRow.id,
            imageUrl: placeholderImage(product.imageText, category.color),
          },
        });
        console.log(`Updated: ${product.name}`);
        continue;
      }

      await prisma.product.create({
        data: {
          name: product.name,
          sku: product.sku,
          description: product.description,
          price: product.price,
          costPrice: product.costPrice,
          categoryId: categoryRow.id,
          imageUrl: placeholderImage(product.imageText, category.color),
          inventory: {
            create: {
              quantity: product.quantity,
              minStock: product.minStock,
            },
          },
        },
      });
      console.log(`Created: ${product.name}`);
    }
  }

  console.log("Catalog seed complete.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
