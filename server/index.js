import express from "express";
import cors from "cors";
import multer from "multer";
import { Queue } from "bullmq";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { QdrantClient } from "@qdrant/js-client-rest";
import dotenv from "dotenv";

dotenv.config();

const queue = new Queue("pdf-queue", {
    connection: {
        host: "localhost",
        port: 6379
    },
});

const genAi = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const client = new QdrantClient({ url: `http://localhost:6333` });

const storage = multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb) => {
        cb(null, `${file.originalname}-${Date.now()}.pdf`);
    }
});

const upload = multer({ storage });

const app = express();

app.use(cors());

app.get("/", (req, res) => {
    res.json({ message: "QueryDocs API" });
});

app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

app.post("/upload", upload.single("pdf"), async (req, res) => {
    try {
        await queue.add("pdf-queue", JSON.stringify({
            filename: req.file.originalname,
            destination: req.file.destination,
            path: req.file.path
        }));

        res.json({ message: "File uploaded successfully" });
    } catch (error) {
        console.error("Error uploading file:", error);
        res.status(500).json({ error: error.message });
    }
});

app.get("/chat", async (req, res) => {
    try {
        const userQuery = req.query.q;
        console.log(`Processing chat query: ${userQuery}`);

        const embeddings = new GoogleGenerativeAIEmbeddings({
            apiKey: process.env.GOOGLE_API_KEY,
            modelName: "models/embedding-001"
        });

        const vectorStore = await QdrantVectorStore.fromExistingCollection(
            embeddings,
            {
                client,
                collectionName: "pdf-docs",
            }
        );

        const retriever = vectorStore.asRetriever({ k: 2 });
        const relevantDocs = await retriever.invoke(userQuery);

        const context = relevantDocs.map((doc, i) =>
            `Document ${i + 1}:\n${doc.pageContent}`
        ).join('\n\n');

        const prompt = `You are a helpful assistant answering questions based on provided documents.

Context documents from the knowledge base:
${context}

User question: ${userQuery}

Answer the question based ONLY on the information provided in the context documents. If the context doesn't contain relevant information to answer the question, acknowledge that and don't make up information. Provide a clear, concise answer with specific details from the documents.`;

        const model = genAi.getGenerativeModel({ model: "gemini-2.5-flash" });
        const chatResult = await model.generateContent(prompt);
        const answer = chatResult.response.text();

        return res.json({
            answer,
            documents: relevantDocs
        });
    } catch (error) {
        console.error("Error in chat endpoint:", error);
        return res.status(500).json({ error: error.message });
    }
});

app.listen(4001, () => {
    console.log("Server is running on port 4001");
});