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

type Product = z.infer<typeof ProductSchema>

const appElement = document.getElementById("app") as HTMLDivElement
const asdElement = document.getElementById("asd") as HTMLDivElement
const laptopButton = document.getElementById("laptop") as HTMLButtonElement
const smartwatchButton = document.getElementById("smartwatch") as HTMLButtonElement
const mobileButton = document.getElementById("mobile") as HTMLButtonElement
const allButton = document.getElementById("allproduct") as HTMLButtonElement
const cartButton = document.getElementById("cartButton") as HTMLButtonElement


const getTypes = async (type: string) => {
  if (!type) {
    return;
  }

  const response = await safeFetch("GET", `http://localhost:4000/api/products/${type}`)

  if (!response.success) {
    alert(response.status);
    return
  }

  if (response.status >= 500) {
    return;
  }

  if (!response) return;

  const products = response.data
  const result = ProductSchema.array().safeParse(products);

  if (!result.success) {
    alert("Oops");
    return;
  };

  const validatedData = result.data
  const productContent = validatedData.filter((product) => product.type === type);
  const mappedProduct = productContent.map((product) => `<div class="card card-compact w-96 bg-base-100 shadow-xl">
    <figure class="w-full h-[200px]"><img src="${product.imgSrc}" alt="Watch" class="w-auto h-[200px]" /></figure>
    <div class="card-body">
      <h2 class="card-title">${product.productName}</h2>
      <p class="border-solid border-2 border-indigo-400 w-fit px-1 rounded-md">${product.type}</p>
      <p class="text-2xl text-red-400 font-bold my-5">${product.price} &euro;</p>
      <div class="card-actions justify-end">
        <button id="${product.id}" class="btn btn-primary text-white hover:bg-violet-600 add-cart">Kosárba</button>
      </div>
    </div>
  </div>`).join("");

  appElement.innerHTML = mappedProduct;

  const cartButtons = document.querySelectorAll(".add-cart")

  cartButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      const productToAdd = validatedData.find((product) => product.id === +button.id)
      postData(productToAdd!)
    })
  });
}

const getAllData = async () => {
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
  const productContent = validatedData.map((product) => `<div class="card card-compact w-96 bg-base-100 shadow-xl">
    <figure class="w-full h-[200px]"><img src="${product.imgSrc}" alt="Watch" class="w-auto h-[200px]" /></figure>
    <div class="card-body">
      <h2 class="card-title">${product.productName}</h2>
      <p class="border-solid border-2 border-indigo-400 w-fit px-1 rounded-md">${product.type}</p>
      <p class="text-2xl text-red-400 font-bold my-5">${product.price} &euro;</p>
      <div class="card-actions justify-end">
        <button id="${product.id}" class="btn btn-primary text-white hover:bg-violet-600 add-cart">Kosárba</button>
      </div>
    </div>
  </div>`).join("")


  appElement.innerHTML = productContent

  const cartButtons = document.querySelectorAll(".add-cart")

  cartButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      const productToAdd = validatedData.find((product) => product.id === +button.id)
      postData(productToAdd!)
    })
  });
}

const getCartData = async () => {

  const response = await safeFetch("GET", `http://localhost:4000/api/cart`)

  if (!response.success) {
    alert(response.status);
    return
  }

  if (response.status >= 500) {
    return;
  }

  if (!response) return;

  const products = response.data
  const result = ProductSchema.array().safeParse(products);

  if (!result.success) {
    alert("Oops");
    return;
  };

  const validatedData = result.data
  let sum = 0
  for (let index = 0; index < validatedData.length; index++) {
    const product = validatedData[index];
    sum += product.price
  }

  const mappedProduct = validatedData.map((product) => `
    <div class="w-full flex justify-end">
        <div class="flex items-center gap-4 justify-end mx-20 bg-blue-200 w-[400px] px-5">
            <h2>${product.productName}</h2>
            <p class="text-xl text-red-400 font-bold my-5">${product.price} &euro;</p>
            <button id="${product.id}" class="hover:text-2xl hover:text-red-600 remove-cart">X</button>
        </div>
    </div>
    `).join("");


  appElement.innerHTML = `
    ${orderDetails}
    <div>
    ${mappedProduct}
    <div class="flex items-center gap-4 justify-end mx-20 px-5">
    <p class="text-2xl text-red-400 font-bold my-5">Fizetendő: ${Math.round(sum)} &euro;</p>
    </div>
    </div>
    `;

  const removeButtons = document.querySelectorAll(".remove-cart")

  removeButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      await deleteData(button.id)
      getCartData()
    })
  });

  const orderButton = document.getElementById("rendeles") as HTMLButtonElement

  orderButton.addEventListener("click", async () => {
    asdElement.innerHTML = `
    <div class="navbar bg-blue-400 text-white mb-10 px-20">
    <div class="flex-1">
      <ul class="menu menu-horizontal px-1 text-xl gap-8">
        <li><a href="index.html">Vissza a kezdőlap</a></li>
      </ul>
    </div>
    </div>
    <div id="banner" class="hero">
      <div class="hero-content flex-col lg:flex-row">
        <img src="assets/129728.jpg" alt="banner"
          class="max-w-screen-xl rounded-tl-[60px] rounded-br-[60px] shadow-2xl">
        <p class=" text-white md:text-5xl text-3xl text-center absolute">Rendelés sikeresen elküldve</p>
      </div>
    </div>`

  })
}

const postData = async (param: Product) => {
  const response = await safeFetch("POST", "http://localhost:4000/api/products", {
    id: param.id,
    type: param.type,
    productName: param.productName,
    price: param.price,
    imgSrc: param.imgSrc
  })
  if (response?.status === 200) {
    alert("Hozzáadva a kosárhoz")
  } else {
    alert("Error")
  }
}

const deleteData = async (id: string) => {
  const response = await safeFetch("DELETE", `http://localhost:4000/api/cart/${id}`)
  if (!response.success) return
}

allButton.addEventListener("click", () => {
  getAllData()
})
cartButton.addEventListener("click", () => {
  getCartData()
})
laptopButton.addEventListener("click", () => {
  getTypes("laptop")
})
smartwatchButton.addEventListener("click", () => {
  getTypes("smartwatch")
})
mobileButton.addEventListener("click", () => {
  getTypes("smartphone")
})


const orderDetails = `
<div class="flex flex-col">
  <form class="w-full max-w-lg">
    <p class="text-2xl mb-10 font-bold" >Szállítási és számlázási adatok</p>
    <div class="flex flex-wrap -mx-3 mb-3">
        <div class="w-full md:w-1/2 px-3 mb-3 md:mb-0">
          <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" for="grid-first-name">
            Vezetéknév
          </label>
          <input class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none" id="grid-first-name" type="text" placeholder="Tök">
        </div>
        <div class="w-full md:w-1/2 px-3">
          <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" for="grid-last-name">
            Keresztnév
          </label>
          <input class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none 0" id="grid-last-name" type="text" placeholder="Ödön">
        </div>
    </div>
      <div class="flex flex-wrap -mx-3 mb-3">
        <div class="w-full px-3">
          <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" for="grid-password">
            E-mail cím
          </label>
          <input class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none " id="grid-password" type="email" placeholder="tokodon@gmail.com">
        </div>
      </div>
    <div class="flex flex-wrap -mx-3 mb-2">
      <div class="w-full md:w-1/3 px-3 mb-6 md:mb-3">
        <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" for="grid-city">
          Irányítószám
        </label>
        <input class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none " id="grid-city" type="text" placeholder="1141">
      </div>
      <div class="w-full md:w-1/3 px-3 mb-6 md:mb-0">
        <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" for="grid-city">
          Ország
        </label>
        <input class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none" id="grid-city" type="text" placeholder="Magyarország">
      </div>
      <div class="w-full md:w-1/3 px-3 mb-6 md:mb-0">
        <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" for="grid-city">
          Város
        </label>
        <input class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none " id="grid-city" type="text" placeholder="Budapest">
      </div>
    </div>
      <div class="flex flex-wrap -mx-3 mb-6">
        <div class="w-full px-3">
          <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" for="grid-password">
            Utca, házszám
          </label>
          <input class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none " id="grid-password" type="email" placeholder="xy utca 123.">
        </div>
      </div>
  </form>
    <label class="md:w-2/3 block text-gray-500 font-bold mb-5">
      <input id="checkbox" class="mr-2 leading-tight" type="checkbox">
      <span class="text-sm">
        A rendelés leadásával elfogadom az ÁSZF-et
      </span>
    </label>
  <button id="rendeles" class="btn btn-primary text-white">Rendelés elküldése</button>
</div>
`