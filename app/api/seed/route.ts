import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI;

export async function GET() {
  if (!MONGODB_URI) {
    return NextResponse.json(
      { error: "MONGODB_URI tidak ditemukan" },
      { status: 500 },
    );
  }

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db("ruangnadi");
    const collection = db.collection("menus");

    // DATA 5 PASTRY DENGAN LINK UNSPLASH TERBARU
    const pastryData = [
      {
        name: "Almond Croissant",
        category: "Pastry",
        desc: "Croissant renyah dengan isian krim almond manis dan taburan kacang almond panggang.",
        img: "https://images.unsplash.com/photo-1509456248232-261730999815?auto=format&fit=crop&w=800&q=80",
        isAvailable: true,
        variants: [{ label: "1 Pcs", price: 32000 }],
      },
      {
        name: "Kouign Amann",
        category: "Pastry",
        desc: "Pastry klasik asal Prancis dengan lapisan gula karamel yang renyah dan gurihnya butter.",
        img: "https://images.unsplash.com/photo-1555507036-ab1f40388085?auto=format&fit=crop&w=800&q=80",
        isAvailable: true,
        variants: [{ label: "1 Pcs", price: 28000 }],
      },
      {
        name: "Strawberry Danish",
        category: "Pastry",
        desc: "Puff pastry dengan custard vanilla yang lembut dan topping buah strawberry segar.",
        img: "https://images.unsplash.com/photo-1505253668822-420420b3f46e?auto=format&fit=crop&w=800&q=80",
        isAvailable: true,
        variants: [{ label: "1 Pcs", price: 29000 }],
      },
      {
        name: "Chocolate Éclair",
        category: "Pastry",
        desc: "Kue sus memanjang dengan isian krim cokelat Belgian dan lapisan ganache cokelat premium.",
        img: "https://images.unsplash.com/photo-1511911063855-2bf39afa5b2e?auto=format&fit=crop&w=800&q=80",
        isAvailable: true,
        variants: [{ label: "1 Pcs", price: 25000 }],
      },
      {
        name: "Premium Sausage Roll",
        category: "Pastry",
        desc: "Pastry gurih dengan isian sosis sapi bratwurst jumbo dan taburan wijen.",
        img: "https://images.unsplash.com/photo-1565256503932-d818293672d5?auto=format&fit=crop&w=800&q=80",
        isAvailable: true,
        variants: [{ label: "1 Pcs", price: 35000 }],
      },
    ];

    const result = await collection.insertMany(pastryData);

    return NextResponse.json({
      message: `Berhasil menambahkan ${result.insertedCount} pastry baru!`,
      insertedCount: result.insertedCount,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.toString() }, { status: 500 });
  } finally {
    await client.close();
  }
}
