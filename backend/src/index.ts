import express from "express"
import { z } from "zod"
import filesystem from "fs/promises"
import cors from "cors"

const server = express()
server.use(cors())

server.use(express.json())

const QueryParamPriceSchema = z.object({
    min: z.coerce.number(),
    max: z.coerce.number()
})
/* const QueryParamTypeSchema = z.object({
    type: z.string(),
}) */

const ProductSchema = z.object({
    id: z.number(),
    type: z.string(),
    productName: z.string(),
    price: z.number(),
    imgSrc: z.string()
})

const CartSchema = z.object({
    id: z.number(),
    type: z.string(),
    productName: z.string(),
    price: z.number(),
    imgSrc: z.string()
})

const CreateCartSchema = z.object({
    type: z.string(),
    productName: z.string(),
    price: z.number(),
    imgSrc: z.string()
})

type Product = z.infer<typeof ProductSchema>

const readfile = async (database: string) => {
    try {
        const rawData = await filesystem.readFile(`${__dirname}/../${database}`, "utf-8");
        const products: Product[] = JSON.parse(rawData)
        console.log(products)
        return products
    } catch (error) {
        return null
    }
}

const saveDB = async (data: any) => {
    try {
        const fileContent = JSON.stringify(data)
        await filesystem.writeFile(`${__dirname}/../cart.json`, fileContent)
        return true
    } catch (error) {
        return false
    }
}


server.get("/api/products", async (req, res) => {
    const products = await readfile("database.json")
    res.json(products)
}
)

server.get("/api/products/price", async (req, res) => {
    const result = QueryParamPriceSchema.safeParse(req.query)
    if (!result.success)
        return res.status(400).json(result.error.issues)

    const products = await readfile("database.json")
    const queryParams = result.data
    const filteredProducts = products?.filter(product => product.price > queryParams.min && product.price < queryParams.max)
    res.json(filteredProducts)
}
)

server.get("/api/products/:type", async (req, res) => {
    const type = req.params.type
    const products = await readfile("database.json")
    if (!products)
        return res.sendStatus(500)

    const filteredProductTypes = products?.filter(product => product.type === type)
    res.json(filteredProductTypes)
}
)

server.get("/api/cart", async (req, res) => {
    const cart = await readfile("cart.json")
    res.json(cart)
}
)

server.post("/api/products", async (req, res) => {
    const result = CartSchema.safeParse(req.body)
    if (!result.success)
        return res.status(400).json(result.error.issues)
    const addCart = result.data

    const cartData = await readfile("cart.json")
    if (!cartData) return res.sendStatus(500)

    const isSuccessful = await saveDB([...cartData, { ...addCart }])
    if (!isSuccessful)
        return res.sendStatus(500)

    res.json({ ...cartData })
})

server.delete("/api/cart/:id", async (req, res) => {
    const result = z.coerce.number().safeParse(req.params.id)
    if (!result.success) return res.status(400).json(result.error.issues)
    const id = result.data

    const cart = await readfile("cart.json")
    if (!cart) return res.sendStatus(500)

    const filteredProducts = cart.filter((product) => product.id !== id)
    if (!filteredProducts) return res.sendStatus(500)

    await filesystem.writeFile(`${__dirname}/../cart.json`, JSON.stringify(filteredProducts, null, 2))

    res.sendStatus(200)
})

server.delete("/api/products/editor/:id", async (req, res) => {
    const result = z.coerce.number().safeParse(req.params.id)
    if (!result.success) return res.status(400).json(result.error.issues)
    const id = result.data

    const products = await readfile("database.json")
    if (!products) return res.sendStatus(500)

    const filteredProducts = products.filter((product) => product.id !== id)
    if (!filteredProducts) return res.sendStatus(500)

    await filesystem.writeFile(`${__dirname}/../database.json`, JSON.stringify(filteredProducts, null, 2))

    res.sendStatus(200)
})

server.patch("/api/products/editor/:id", async (req, res) => {
    const id = +req.params.id
    const products = await readfile("database.json")
    if (!products) return res.sendStatus(500)

    const productToUpdate = products.find(product => product.id === id)
    if (!productToUpdate) return res.sendStatus(404)

    const result = CreateCartSchema.safeParse(req.body)
    if (!result.success) return res.status(400).json(result.error.issues)

    const updatedProduct = products.map(product => {
        if (product.id === id) {
            return { ...result.data, id }
        }
        return product
    })
    await filesystem.writeFile(`${__dirname}/../database.json`, JSON.stringify(updatedProduct, null, 2))

    res.sendStatus(200)

})

server.post("/api/products/editor", async (req, res) => {
    const result = CreateCartSchema.safeParse(req.body)
    if (!result.success) {
        return res.status(400).json(result.error.issues)
    }
    const products = await readfile("database.json")
    if (products === null) {
        res.sendStatus(500)
        return
    }
    const randomNumber = Math.floor(Math.random() * 1000);
    products.push({ ...result.data, id: randomNumber })

    await filesystem.writeFile(`${__dirname}/../database.json`, JSON.stringify(products, null, 2))

    res.json({ id: randomNumber })
})



server.listen(4000)