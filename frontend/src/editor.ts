import './style.css'
import { z } from "zod"
import { safeFetch } from './safeFetch'

const ProductSchema = z.object({
    id: z.number(),
    type: z.string(),
    productName: z.string(),
    price: z.number(),
    imgSrc: z.string()
})

// type Product = z.infer<typeof ProductSchema>

const editorAllList = document.getElementById("editorAll") as HTMLButtonElement
const allProductDiv = document.getElementById("all-product-in-editor") as HTMLDivElement
const selectInput = document.getElementById("select-input") as HTMLSelectElement
const nameInput = document.getElementById("name") as HTMLInputElement
const priceInput = document.getElementById("price") as HTMLInputElement
const pictureInput = document.getElementById("url") as HTMLInputElement
const addButton = document.getElementById("add-new-product") as HTMLButtonElement

const hideModifyWindow = () => {
    (document.getElementById("updateInputsDiv") as HTMLDialogElement).style.display = "none"
};

const displayModifyWindow = () => {
    (document.getElementById("updateInputsDiv") as HTMLDialogElement).style.display = "flex";
}

let productId: number | null = null;

const updatedNameInput = document.getElementById("updatedNameInput") as HTMLInputElement;
const updatedPriceInput = document.getElementById("updatedPriceInput") as HTMLInputElement;
const updatedTypeInput = document.getElementById("updatedTypeInput") as HTMLSelectElement;
const updatedImgInput = document.getElementById("updatedImgInput") as HTMLInputElement;

const saveButton = document.getElementById("save") as HTMLButtonElement;
const cancelButton = document.getElementById("cancel") as HTMLButtonElement;

saveButton.addEventListener("click", async () => {
    await modifyData();
    hideModifyWindow();
    window.location.reload()
});

cancelButton.addEventListener("click", hideModifyWindow);


const getEditorAllData = async () => {
    const response = await safeFetch("GET", "http://localhost:4000/api/products")
    if (!response.success) {
        alert(response.status);
        return
    }

    if (response.status >= 500) {
        return;
    }

    if (!response) return;

    const products = response.data
    const result = ProductSchema.array().safeParse(products)

    if (!result.success) {
        alert("Oops");
        return;
    };

    const validatedData = result.data
    const productContent = validatedData.map((product) => `
    <div class="grid grid-cols-10 items-center gap-10 py-4 px-20">
    <p class="w-fit px-1 rounded-md col-span-1">${product.id}</p>
    <p class="font-bold col-span-3">${product.productName}</p>
      <p class="col-span-1">${product.type}</p>
      <p class="col-span-1">${product.price} &euro;</p>
      <div class="card-actions justify-end col-span-2">
        <button id="${product.id}-delete" class="bg-red-500 rounded-md px-2 delete">Törlés</button>
        
        <button id="${product.id}-modify" class="bg-green-500 rounded-md px-2 modify">Módosítás</button>
        
      </div>
    </div>
  </div>`).join("")

    allProductDiv.insertAdjacentHTML("beforeend", productContent)

    const deleteButtons = document.querySelectorAll(".delete")

    deleteButtons.forEach((button) => {
        button.addEventListener("click", async () => {
            await deleteData(button.id.split("-")[0])
            window.location.reload()
        })
    });

    const modifyButtons = document.getElementsByClassName("modify") as HTMLCollectionOf<Element>

    [...modifyButtons].forEach((button) =>
        button.addEventListener("click", async () => {
            displayModifyWindow();
            productId = +button.id.split("-")[0];
            updatedNameInput.value = validatedData.find((product) => { return product.id === productId })!.productName;
            updatedPriceInput.value = "" + validatedData.find((product) => { return product.id === productId })!.price;
            updatedTypeInput.value = validatedData.find((product) => { return product.id === productId })!.type;
            updatedImgInput.value = "" + validatedData.find((product) => { return product.id === productId })!.imgSrc;

        }));
}

const deleteData = async (id: string) => {
    const response = await safeFetch("DELETE", `http://localhost:4000/api/products/editor/${id}`)
    if (!response.success) return
}

const modifyData = async () => {
    const response = await safeFetch("PATCH", `http://localhost:4000/api/products/editor/${productId}`, {
        type: updatedTypeInput.value,
        productName: updatedNameInput.value,
        price: +updatedPriceInput.value,
        imgSrc: updatedImgInput.value
    });
    if (!response.success) return
};

const postData = async () => {
    const response = await safeFetch("POST", "http://localhost:4000/api/products/editor", {
        type: selectInput.value,
        productName: nameInput.value,
        price: + priceInput.value,
        imgSrc: pictureInput.value

    })
    if (!response.success) return
};

editorAllList.addEventListener("click", () => {
    getEditorAllData()
})

addButton.addEventListener("click", () => {
    postData()
    window.location.reload()
})
