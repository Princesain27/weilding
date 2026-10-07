// ==========================================
// DURGA LAKSHMI WELDING SOLUTION
// CLEAN SUPABASE APP.JS
// ==========================================

const SUPABASE_URL = 'https://hjrbziulghdtxmdgkata.supabase.co';
const SUPABASE_KEY = 'sb_publishable_v_KiLhoaFlL5iedKeuasgA_aVWOXE7q';

const db = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

const WHATSAPP_NUMBER = '918295993117';

let products = [];
let cart = [];
let current = 'All';


// ==========================================
// HELPERS
// ==========================================

const $ = id => document.getElementById(id);

const money = value =>
  '₹' + Number(value || 0).toLocaleString('en-IN');

const escapeHTML = value =>
  String(value ?? '').replace(
    /[&<>"']/g,
    char => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[char])
  );

const iconFor = category => {
  if (category === 'Electrodes') return '⚡';
  if (category === 'Machines') return '🔧';
  return '🛡️';
};

const cartCount = () =>
  cart.reduce((sum, item) => sum + item.qty, 0);

const cartTotal = () =>
  cart.reduce((sum, item) => {
    const product = products.find(p => p.id === item.id);

    return sum +
      (product
        ? Number(product.price) * item.qty
        : 0);
  }, 0);


// ==========================================
// TOAST
// ==========================================

function toast(message) {
  const element = $('toast');

  if (!element) return;

  element.textContent = message;
  element.style.display = 'block';

  setTimeout(() => {
    element.style.display = 'none';
  }, 2000);
}


// ==========================================
// LOAD PRODUCTS FROM SUPABASE
// ==========================================

async function loadProducts() {

  const { data, error } = await db
    .from('products')
    .select('*')
    .order('id', { ascending: true });

  if (error) {
    console.error('Products load error:', error);
    toast('Products load error: ' + error.message);
    return;
  }

  products = data || [];

  renderProducts();
  renderPageCart();
  updateCart();
}


// ==========================================
// PRODUCT IMAGE / CARD FIX
// ==========================================

function ensureProductCardImageFix() {

  if (document.getElementById('productCardImageFix')) {
    return;
  }

  const style = document.createElement('style');

  style.id = 'productCardImageFix';

  style.textContent = `

    /*
      FIX:
      Uploaded image ko fixed area ke andar rakho.
      Isse image product name/price ko push nahi karegi.
    */

    .productImg {
      height: 260px !important;
      min-height: 260px !important;
      max-height: 260px !important;

      overflow: hidden !important;

      position: relative !important;

      display: grid !important;
      place-items: center !important;

      box-sizing: border-box !important;
    }


    .productImg > img {

      width: 100% !important;
      height: 100% !important;

      object-fit: contain !important;

      display: block !important;

      max-width: 100% !important;
      max-height: 100% !important;
    }


    /*
      Product information ko image se alag rakho.
    */

    .card .info {

      display: block !important;

      position: relative !important;

      z-index: 2 !important;

      min-height: 180px !important;

      overflow: visible !important;
    }


    /*
      Price ko forcefully visible rakho.
    */

    .card .price {

      display: block !important;

      visibility: visible !important;

      opacity: 1 !important;

      position: relative !important;

      z-index: 3 !important;
    }


    /*
      Product title.
    */

    .card .info h3 {

      position: relative !important;

      z-index: 3 !important;
    }


    /*
      Description / stock.
    */

    .card .info .meta {

      position: relative !important;

      z-index: 3 !important;
    }


    /*
      Add to cart button.
    */

    .card .info .add {

      position: relative !important;

      z-index: 3 !important;
    }

  `;

  document.head.appendChild(style);
}


// ==========================================
// PRODUCT DISPLAY
// ==========================================

function renderProducts() {

  ensureProductCardImageFix();

  const grid = $('grid');

  if (!grid) return;


  const list = products.filter(product => {

    if (current === 'All') {
      return true;
    }


    if (current === 'Appliances') {

      return [
        'Machines',
        'Accessories'
      ].includes(product.category);

    }


    return product.category === current;

  });


  grid.innerHTML = list.map(product => {

    const stock =
      Number(product.stock || 0);


    return `

      <div class="card">


        <!-- PRODUCT IMAGE -->

        <div class="productImg">


          ${
            product.image_url

              ? `

                <img

                  src="${escapeHTML(
                    product.image_url
                  )}"

                  alt="${escapeHTML(
                    product.name
                  )}"

                  style="
                    width:100%;
                    height:100%;
                    object-fit:contain;
                    display:block;
                  "

                  onerror="
                    this.style.display='none';

                    if (
                      this.nextElementSibling
                    ) {
                      this.nextElementSibling.style.display='grid';
                    }
                  "

                >

              `

              : ''

          }


          <!-- FALLBACK ICON -->

          <span

            style="
              ${
                product.image_url
                  ? 'display:none;'
                  : 'display:grid;'
              }

              width:100%;
              height:100%;
              place-items:center;
              font-size:64px;
            "

          >

            ${iconFor(product.category)}

          </span>


          <!-- OUT OF STOCK -->

          ${
            stock <= 0

              ? `
                <div class="badge">
                  Out of Stock
                </div>
              `

              : ''
          }


        </div>


        <!-- PRODUCT INFORMATION -->

        <div class="info">


          <!-- NAME -->

          <h3>

            ${escapeHTML(
              product.name
            )}

          </h3>


          <!-- DESCRIPTION + STOCK -->

          <div class="meta">

            ${escapeHTML(
              product.description ||
              product.category
            )}

            • Stock: ${stock}

          </div>


          <!-- PRICE -->

          <div class="price">

            ${money(
              product.price
            )}

          </div>


          <!-- CART BUTTON -->

          <button

            class="add"

            ${
              stock <= 0

                ? 'disabled'

                : `
                  onclick="DLadd(
                    ${product.id}
                  )"
                `
            }

          >

            ${
              stock <= 0
                ? 'Out of Stock'
                : 'Add to Cart'
            }

          </button>


        </div>


      </div>

    `;

  }).join('');

}


// ==========================================
// FILTER
// ==========================================

window.filter = function(
  category,
  button
) {

  current = category;


  document
    .querySelectorAll('.filter')
    .forEach(item =>
      item.classList.remove('active')
    );


  if (button) {
    button.classList.add('active');
  }


  renderProducts();

};


// ==========================================
// CART
// ==========================================

window.DLadd = function(id) {

  const product =
    products.find(
      item => item.id === id
    );


  if (!product) {

    return toast(
      'Product not found'
    );

  }


  const stock =
    Number(product.stock || 0);


  if (stock <= 0) {

    return toast(
      'Out of stock'
    );

  }


  const item =
    cart.find(
      item => item.id === id
    );


  if (item) {


    if (item.qty >= stock) {

      return toast(
        'Stock limit reached'
      );

    }


    item.qty++;


  } else {


    cart.push({
      id,
      qty: 1
    });


  }


  updateCart();

  renderPageCart();

  goPage('cart');

  toast(
    'Added to cart'
  );

};


// ==========================================
// CHANGE CART QUANTITY
// ==========================================

window.DLqty = function(
  id,
  change
) {

  const item =
    cart.find(
      item => item.id === id
    );


  const product =
    products.find(
      product => product.id === id
    );


  if (!item || !product) {
    return;
  }


  if (
    change > 0 &&
    item.qty >= Number(
      product.stock
    )
  ) {

    return toast(
      'Stock limit reached'
    );

  }


  item.qty += change;


  if (item.qty <= 0) {

    cart =
      cart.filter(
        item => item.id !== id
      );

  }


  updateCart();

  renderPageCart();

};


// ==========================================
// UPDATE CART COUNT
// ==========================================

function updateCart() {

  const countElement =
    $('cartCount');


  if (countElement) {

    countElement.textContent =
      cartCount();

  }

}


// ==========================================
// RENDER FULL CART PAGE
// ==========================================

function renderPageCart() {

  const container =
    $('pageCartItems');


  if (!container) {
    return;
  }


  if (!cart.length) {


    container.innerHTML = `

      <p
        style="color:var(--muted)"
      >

        Your cart is empty.

        Go to Products and add items.

      </p>

    `;


  } else {


    container.innerHTML =
      cart.map(item => {


        const product =
          products.find(
            p => p.id === item.id
          );


        if (!product) {
          return '';
        }


        return `

          <div class="cartItem">


            <div>


              <b>

                ${escapeHTML(
                  product.name
                )}

              </b>


              <div class="meta">

                ${escapeHTML(
                  product.description ||
                  product.category
                )}

                • ${money(
                  product.price
                )} each

              </div>


            </div>


            <div class="qty">


              <button
                onclick="DLqty(
                  ${product.id},
                  -1
                )"
              >

                −

              </button>


              <b>

                ${item.qty}

              </b>


              <button
                onclick="DLqty(
                  ${product.id},
                  1
                )"
              >

                +

              </button>


            </div>


            <strong>

              ${money(
                Number(
                  product.price
                ) *
                item.qty
              )}

            </strong>


          </div>

        `;


      }).join('');

  }


  const itemCount =
    $('pageItemCount');


  const total =
    $('pageCartTotal');


  if (itemCount) {

    itemCount.textContent =
      cartCount();

  }


  if (total) {

    total.textContent =
      money(
        cartTotal()
      );

  }

}


// ==========================================
// PAGE NAVIGATION
// ==========================================

window.goPage =
  async function(page) {


    document
      .querySelectorAll('.sitePage')
      .forEach(section =>
        section.classList.remove(
          'activePage'
        )
      );


    const target =
      document.getElementById(
        'page-' + page
      );


    if (target) {

      target.classList.add(
        'activePage'
      );

    }


    if (page === 'products') {

      renderProducts();

    }


    if (page === 'cart') {

      renderPageCart();

    }


    if (page === 'admin') {

      await renderAdmin();

    }


    window.scrollTo({

      top: 0,

      behavior: 'smooth'

    });

  };


// ==========================================
// WHATSAPP + SUPABASE ORDER
// ==========================================

window.sendPageWhatsApp =
  async function() {


    if (!cart.length) {

      return toast(
        'Add products first'
      );

    }


    const name =
      $('pageCustName')?.value.trim();


    const phone =
      $('pageCustPhone')?.value.trim();


    const address =
      $('pageCustAddress')?.value.trim();


    if (
      !name ||
      !phone ||
      !address
    ) {

      return toast(
        'Please fill customer details'
      );

    }


    const cleanPhone =
      phone.replace(
        /\D/g,
        ''
      );


    if (
      cleanPhone.length < 10 ||
      cleanPhone.length > 15
    ) {

      return toast(
        'Valid mobile number enter karo'
      );

    }


    // Validate cart

    const rows =
      cart.map(item => {


        const product =
          products.find(
            p => p.id === item.id
          );


        if (!product) {
          return null;
        }


        const quantity =
          Math.floor(
            Number(item.qty)
          );


        const stock =
          Number(
            product.stock || 0
          );


        if (
          !Number.isInteger(
            quantity
          ) ||
          quantity < 1 ||
          quantity > stock
        ) {

          return null;

        }


        return {

          product_id:
            product.id,

          product_name:
            product.name,

          quantity,

          price:
            Number(
              product.price
            ),

          subtotal:
            Number(
              product.price
            ) *
            quantity

        };


      }).filter(Boolean);


    if (
      rows.length !==
      cart.length
    ) {

      return toast(
        'Cart has unavailable or out-of-stock items'
      );

    }


    if (!rows.length) {

      return toast(
        'Products unavailable'
      );

    }


    const total =
      rows.reduce(
        (sum, row) =>
          sum +
          row.subtotal,
        0
      );


    // CREATE ORDER

    const orderResult =
      await db
        .from('orders')
        .insert({

          customer_name:
            name,

          customer_phone:
            phone,

          customer_address:
            address,

          total_amount:
            total,

          status:
            'New'

        })
        .select('id')
        .single();


    if (orderResult.error) {

      console.error(
        'Order error:',
        orderResult.error
      );


      return toast(
        'Order save error: ' +
        orderResult.error.message
      );

    }


    const orderId =
      orderResult.data.id;


    // CREATE ORDER ITEMS

    const itemResult =
      await db
        .from('order_items')
        .insert(

          rows.map(row => ({

            ...row,

            order_id:
              orderId

          }))

        );


    if (itemResult.error) {

      console.error(
        'Order items error:',
        itemResult.error
      );


      return toast(
        'Order items error: ' +
        itemResult.error.message
      );

    }


    // WHATSAPP MESSAGE

    const lines =
      rows
        .map(row =>
          `• ${row.product_name} × ${row.quantity} = ${money(row.subtotal)}`
        )
        .join('\n');


    const message =
`*NEW ORDER – DURGA LAKSHMI WELDING SOLUTION*

Order #${orderId}

${lines}

*Total: ${money(total)}*

Name: ${name}
Mobile: ${phone}
Address: ${address}`;


    const whatsappURL =
      'https://wa.me/' +
      WHATSAPP_NUMBER +
      '?text=' +
      encodeURIComponent(
        message
      );


    const whatsappWindow =
      window.open(
        whatsappURL,
        '_blank'
      );


    cart = [];

    updateCart();

    renderPageCart();


    if (whatsappWindow) {

      toast(
        'Order saved successfully'
      );

    } else {

      toast(
        'Order saved. WhatsApp popup may be blocked'
      );

    }

  };


// ==========================================
// ADMIN LOGIN
// ==========================================

async function renderAdmin() {

  const box =
    document.querySelector(
      '#page-admin .fullAdmin'
    );


  if (!box) {
    return;
  }


  const {
    data: {
      session
    }
  } =
    await db.auth.getSession();


  if (!session) {


    box.innerHTML = `

      <div
        class="fullCard"
        style="
          max-width:460px;
          margin:20px auto
        "
      >


        <h2>
          Admin Login
        </h2>


        <p
          style="
            color:var(--muted)
          "
        >

          Authorised admin account
          se login karein.

        </p>


        <input

          class="field"

          id="adminEmail"

          type="email"

          placeholder="Admin email"

        >


        <input

          class="field"

          id="adminPassword"

          type="password"

          placeholder="Password"

        >


        <button

          class="primary"

          style="width:100%"

          onclick="DLlogin()"

        >

          Login to Dashboard

        </button>


        <p

          id="adminLoginMsg"

          style="
            color:var(--muted);
            font-size:13px;
          "

        ></p>


      </div>

    `;


    return;

  }


  await loadAdminOverview(
    box,
    session
  );

}


// ==========================================
// ADMIN LOGIN ACTION
// ==========================================

window.DLlogin =
  async function() {


    const email =
      $('adminEmail')?.value.trim();


    const password =
      $('adminPassword')?.value;


    const message =
      $('adminLoginMsg');


    if (
      !email ||
      !password
    ) {


      if (message) {

        message.textContent =
          'Email aur password required hai.';

      }


      return;

    }


    if (message) {

      message.textContent =
        'Logging in...';

    }


    const {
      error
    } =
      await db.auth.signInWithPassword({

        email,

        password

      });


    if (error) {


      if (message) {

        message.textContent =
          error.message;

      }


      return;

    }


    await renderAdmin();

  };


// ==========================================
// ADMIN LOGOUT
// ==========================================

window.DLlogout =
  async function() {

    await db.auth.signOut();

    await renderAdmin();

  };


// ==========================================
// ADMIN OVERVIEW
// ==========================================

async function loadAdminOverview(
  box,
  session
) {


  const [
    ordersResult,
    productsResult
  ] =
    await Promise.all([


      db
        .from('orders')
        .select('*')
        .order(
          'created_at',
          {
            ascending:false
          }
        ),


      db
        .from('products')
        .select('*')
        .order(
          'id',
          {
            ascending:true
          }
        )

    ]);


  if (
    ordersResult.error ||
    productsResult.error
  ) {


    console.error(
      ordersResult.error ||
      productsResult.error
    );


    box.innerHTML = `

      <div class="fullCard">

        <h2>
          Database access error
        </h2>


        <p
          style="
            color:var(--muted)
          "
        >

          Authenticated RLS policies
          check karo.

        </p>


        <button
          class="secondary"
          onclick="DLlogout()"
        >

          Logout

        </button>

      </div>

    `;


    return;

  }


  const orders =
    ordersResult.data || [];


  const productList =
    productsResult.data || [];


  const revenue =
    orders.reduce(
      (sum, order) =>
        sum +
        Number(
          order.total_amount || 0
        ),
      0
    );


  const pending =
    orders.filter(order =>
      [
        'New',
        'Confirmed',
        'Processing'
      ].includes(
        order.status
      )
    ).length;


  box.innerHTML = `

    <div class="sideMenu">


      <button class="active">

        Overview

      </button>


      <button
        onclick="DLproducts()"
      >

        Products

      </button>


      <button
        onclick="DLorders()"
      >

        Orders

      </button>


      <button
        onclick="DLlogout()"
      >

        Logout

      </button>


    </div>


    <div class="adminGrid">


      <div class="adminStat">

        <small>
          Total Orders
        </small>

        <b>
          ${orders.length}
        </b>

      </div>


      <div class="adminStat">

        <small>
          Revenue
        </small>

        <b>
          ${money(revenue)}
        </b>

      </div>


      <div class="adminStat">

        <small>
          Products
        </small>

        <b>
          ${productList.length}
        </b>

      </div>


      <div class="adminStat">

        <small>
          Pending
        </small>

        <b>
          ${pending}
        </b>

      </div>


    </div>


    <div
      class="fullCard"
      style="margin-top:20px"
    >


      <div
        style="
          display:flex;
          justify-content:space-between;
          align-items:center;
          gap:10px;
          flex-wrap:wrap;
        "
      >


        <div>


          <h2>
            Orders
          </h2>


          <p
            style="
              color:var(--muted);
              margin:0;
            "
          >

            ${escapeHTML(
              session.user.email
            )}

          </p>


        </div>


        <button
          class="secondary"
          onclick="renderAdmin()"
        >

          Refresh

        </button>


      </div>


      <div
        style="overflow:auto"
      >


        <table class="adminTable">


          <thead>

            <tr>

              <th>
                Order
              </th>

              <th>
                Customer
              </th>

              <th>
                Phone
              </th>

              <th>
                Total
              </th>

              <th>
                Status
              </th>

            </tr>

          </thead>


          <tbody>


            ${
              orders
                .map(order => `

                  <tr>

                    <td>
                      #${order.id}
                    </td>


                    <td>
                      ${escapeHTML(
                        order.customer_name
                      )}
                    </td>


                    <td>
                      ${escapeHTML(
                        order.customer_phone
                      )}
                    </td>


                    <td>
                      ${money(
                        order.total_amount
                      )}
                    </td>


                    <td>


                      <select

                        class="field"

                        style="
                          margin:0;
                          width:auto;
                        "

                        onchange="
                          DLstatus(
                            ${order.id},
                            this.value
                          )
                        "

                      >


                        ${
                          [
                            'New',
                            'Confirmed',
                            'Processing',
                            'Delivered',
                            'Cancelled'
                          ]

                          .map(status => `

                            <option

                              ${
                                order.status === status
                                  ? 'selected'
                                  : ''
                              }

                            >

                              ${status}

                            </option>

                          `)

                          .join('')
                        }


                      </select>


                    </td>


                  </tr>

                `)

                .join('')
            }


          </tbody>


        </table>


      </div>


    </div>

  `;

}


// ==========================================
// UPDATE ORDER STATUS
// ==========================================

window.DLstatus =
  async function(
    id,
    status
  ) {


    const {
      error
    } =
      await db
        .from('orders')
        .update({
          status
        })
        .eq(
          'id',
          id
        );


    if (error) {


      console.error(
        'Status error:',
        error
      );


      return toast(
        'Status update failed: ' +
        error.message
      );

    }


    toast(
      'Status updated'
    );

  };


// ==========================================
// ORDERS PAGE
// ==========================================

window.DLorders =
  async function() {

    await renderAdmin();

  };


// ==========================================
// ADMIN PRODUCTS
// ==========================================

window.DLproducts =
  async function() {


    const box =
      document.querySelector(
        '#page-admin .fullAdmin'
      );


    if (!box) {
      return;
    }


    const {
      data,
      error
    } =
      await db
        .from('products')
        .select('*')
        .order(
          'id',
          {
            ascending:true
          }
        );


    if (error) {


      box.innerHTML = `

        <div class="fullCard">

          <h2>
            Products access error
          </h2>


          <p>
            Products SELECT policy
            check karo.
          </p>


          <button
            class="secondary"
            onclick="DLorders()"
          >

            Back

          </button>

        </div>

      `;


      return;

    }


    box.innerHTML = `

      <div class="sideMenu">


        <button
          onclick="renderAdmin()"
        >

          Overview

        </button>


        <button class="active">

          Products

        </button>


        <button
          onclick="DLorders()"
        >

          Orders

        </button>


        <button
          onclick="DLlogout()"
        >

          Logout

        </button>


      </div>


      <div class="fullCard">


        <div
          style="
            display:flex;
            justify-content:space-between;
            align-items:center;
            gap:10px;
            flex-wrap:wrap;
          "
        >


          <h2>
            Products
          </h2>


          <button
            class="primary"
            onclick="DLform()"
          >

            + Add Product

          </button>


        </div>


        <div
          style="overflow:auto"
        >


          <table class="adminTable">


            <thead>

              <tr>

                <th>
                  ID
                </th>

                <th>
                  Name
                </th>

                <th>
                  Category
                </th>

                <th>
                  Price
                </th>

                <th>
                  Stock
                </th>

                <th>
                  Image
                </th>

                <th>
                  Action
                </th>

              </tr>

            </thead>


            <tbody>


              ${
                (data || [])
                  .map(product => `

                    <tr>


                      <td>
                        ${product.id}
                      </td>


                      <td>
                        ${escapeHTML(
                          product.name
                        )}
                      </td>


                      <td>
                        ${escapeHTML(
                          product.category
                        )}
                      </td>


                      <td>
                        ${money(
                          product.price
                        )}
                      </td>


                      <td>
                        ${Number(
                          product.stock || 0
                        )}
                      </td>


                      <td>

                        ${
                          product.image_url
                            ? '✅'
                            : '—'
                        }

                      </td>


                      <td>


                        <button

                          class="secondary"

                          onclick="
                            DLform(
                              ${product.id}
                            )
                          "

                        >

                          Edit

                        </button>


                        <button

                          class="secondary"

                          onclick="
                            DLdelete(
                              ${product.id}
                            )
                          "

                        >

                          Delete

                        </button>


                      </td>


                    </tr>

                  `)

                  .join('')
              }


            </tbody>


          </table>


        </div>


      </div>

    `;

  };


// ==========================================
// IMAGE FILE PICKER
// ==========================================

function chooseImageFile() {

  return new Promise(
    resolve => {


      const input =
        document.createElement(
          'input'
        );


      input.type =
        'file';


      input.accept =
        'image/*';


      input.style.display =
        'none';


      document.body.appendChild(
        input
      );


      let finished =
        false;


      const finish =
        file => {


          if (finished) {
            return;
          }


          finished = true;


          input.remove();


          resolve(
            file || null
          );

        };


      input.addEventListener(
        'change',
        () => {

          finish(
            input.files?.[0] ||
            null
          );

        }
      );


      setTimeout(
        () => {

          finish(null);

        },
        30000
      );


      input.click();

    }
  );

}


// ==========================================
// UPLOAD PRODUCT IMAGE
// ==========================================

async function uploadProductImage(
  file,
  productId
) {


  if (!file) {
    return null;
  }


  if (
    !file.type.startsWith(
      'image/'
    )
  ) {


    toast(
      'Please select an image file'
    );


    return null;

  }


  const extension =
    file.name
      .split('.')
      .pop()
      ?.toLowerCase() ||
    'jpg';


  const fileName =
    `product-${productId || Date.now()}-${Date.now()}.${extension}`;


  const filePath =
    fileName;


  const {
    error
  } =
    await db.storage
      .from(
        'product-images'
      )
      .upload(
        filePath,
        file,
        {

          cacheControl:
            '3600',

          upsert:
            true

        }
      );


  if (error) {


    console.error(
      'Image upload error:',
      error
    );


    toast(
      'Image upload failed: ' +
      error.message
    );


    return null;

  }


  const {
    data
  } =
    db.storage
      .from(
        'product-images'
      )
      .getPublicUrl(
        filePath
      );


  return (
    data?.publicUrl ||
    null
  );

}


// ==========================================
// ADD / EDIT PRODUCT MODAL
// ==========================================

window.DLform =
  async function(id) {


    /*
      Find existing product when
      Edit button is clicked.
    */

    const existing =
      id
        ? products.find(
            product =>
              product.id === id
          )
        : null;


    const validCategories = [

      'Electrodes',

      'Machines',

      'Accessories'

    ];


    // ======================================
    // MODAL CSS
    // ======================================

    if (
      !$('productModalStyles')
    ) {


      const style =
        document.createElement(
          'style'
        );


      style.id =
        'productModalStyles';


      style.textContent = `

        .productModalOverlay {

          position: fixed;

          inset: 0;

          background:
            rgba(
              10,
              15,
              25,
              .68
            );

          display: flex;

          align-items: center;

          justify-content: center;

          padding: 20px;

          z-index: 9999;

          backdrop-filter:
            blur(4px);

        }


        .productModal {

          width:
            min(
              680px,
              100%
            );

          max-height:
            90vh;

          overflow:
            auto;

          background:
            #fff;

          border-radius:
            18px;

          box-shadow:
            0 25px 70px
            rgba(
              0,
              0,
              0,
              .3
            );

          padding:
            24px;

          color:
            #17202a;

        }


        .productModalHeader {

          display:
            flex;

          justify-content:
            space-between;

          align-items:
            center;

          gap:
            15px;

          margin-bottom:
            18px;

        }


        .productModalHeader h2 {

          margin:
            0;

        }


        .modalClose {

          border:
            0;

          background:
            #f1f3f5;

          border-radius:
            50%;

          width:
            38px;

          height:
            38px;

          font-size:
            24px;

          cursor:
            pointer;

        }


        .modalFormGrid {

          display:
            grid;

          grid-template-columns:
            1fr 1fr;

          gap:
            14px;

        }


        .modalField {

          display:
            flex;

          flex-direction:
            column;

          gap:
            7px;

        }


        .modalField.full {

          grid-column:
            1 / -1;

        }


        .modalField label {

          font-weight:
            700;

          font-size:
            13px;

        }


        .modalInput,
        .modalSelect,
        .modalTextarea {

          width:
            100%;

          box-sizing:
            border-box;

          padding:
            12px 13px;

          border:
            1px solid
            #d7dce2;

          border-radius:
            10px;

          font:
            inherit;

          background:
            #fff;

          outline:
            none;

        }


        .modalInput:focus,
        .modalSelect:focus,
        .modalTextarea:focus {

          border-color:
            #d32f2f;

          box-shadow:
            0 0 0 3px
            rgba(
              211,
              47,
              47,
              .1
            );

        }


        .modalTextarea {

          resize:
            vertical;

          min-height:
            105px;

        }


        .imagePicker {

          border:
            1.5px dashed
            #c9ced6;

          border-radius:
            12px;

          padding:
            14px;

        }


        .imagePreview {

          width:
            100%;

          height:
            180px;

          object-fit:
            contain;

          background:
            #f6f7f9;

          border-radius:
            10px;

          margin-bottom:
            10px;

          display:
            block;

        }


        .imageEmpty {

          height:
            180px;

          display:
            flex;

          align-items:
            center;

          justify-content:
            center;

          background:
            #f6f7f9;

          border-radius:
            10px;

          color:
            #7b8490;

          margin-bottom:
            10px;

        }


        .modalActions {

          display:
            flex;

          justify-content:
            flex-end;

          gap:
            10px;

          margin-top:
            20px;

        }


        .modalBtn {

          border:
            0;

          border-radius:
            10px;

          padding:
            11px 18px;

          font-weight:
            700;

          cursor:
            pointer;

        }


        .modalCancel {

          background:
            #eef0f2;

          color:
            #303841;

        }


        .modalSave {

          background:
            #c62828;

          color:
            #fff;

        }


        .modalSave:disabled {

          opacity:
            .65;

          cursor:
            not-allowed;

        }


        @media(max-width:600px) {

          .modalFormGrid {

            grid-template-columns:
              1fr;

          }


          .modalField.full {

            grid-column:
              auto;

          }


          .productModal {

            padding:
              18px;

          }

        }

      `;


      document.head.appendChild(
        style
      );

    }


    // ======================================
    // CREATE MODAL
    // ======================================

    const overlay =
      document.createElement(
        'div'
      );


    overlay.className =
      'productModalOverlay';


    overlay.id =
      'productModal';


    overlay.innerHTML = `

      <div

        class="productModal"

        role="dialog"

        aria-modal="true"

        aria-labelledby=
          "productModalTitle"

      >


        <!-- HEADER -->

        <div
          class="productModalHeader"
        >


          <div>


            <div
              class="eyebrow"
              style="
                margin-bottom:4px
              "
            >

              ${
                existing
                  ? 'Edit Product'
                  : 'New Product'
              }

            </div>


            <h2
              id="productModalTitle"
            >

              ${
                existing
                  ? 'Update Product'
                  : 'Add Product'
              }

            </h2>


          </div>


          <button

            type="button"

            class="modalClose"

            id="productModalClose"

            aria-label="Close"

          >

            ×

          </button>


        </div>


        <!-- FORM -->

        <form
          id="productModalForm"
        >


          <div
            class="modalFormGrid"
          >


            <!-- NAME -->

            <div
              class="modalField full"
            >

              <label
                for="modalProductName"
              >

                Name *

              </label>


              <input

                id="modalProductName"

                class="modalInput"

                required

                value="${
                  escapeHTML(
                    existing?.name ||
                    ''
                  )
                }"

                placeholder=
                  "Product name"

              >

            </div>


            <!-- CATEGORY -->

            <div
              class="modalField"
            >

              <label
                for="modalProductCategory"
              >

                Category *

              </label>


              <select

                id="modalProductCategory"

                class="modalSelect"

                required

              >


                ${
                  validCategories
                    .map(
                      category => `

                        <option

                          value="${category}"

                          ${
                            existing?.category ===
                            category

                              ? 'selected'

                              : ''

                          }

                        >

                          ${category}

                        </option>

                      `
                    )
                    .join('')
                }


              </select>


            </div>


            <!-- PRICE -->

            <div
              class="modalField"
            >

              <label
                for="modalProductPrice"
              >

                Price (₹) *

              </label>


              <input

                id="modalProductPrice"

                class="modalInput"

                type="number"

                min="0"

                step="0.01"

                required

                value="${
                  Number(
                    existing?.price ||
                    0
                  )
                }"

                placeholder="0"

              >

            </div>


            <!-- STOCK -->

            <div
              class="modalField"
            >

              <label
                for="modalProductStock"
              >

                Stock *

              </label>


              <input

                id="modalProductStock"

                class="modalInput"

                type="number"

                min="0"

                step="1"

                required

                value="${
                  Number(
                    existing?.stock ||
                    0
                  )
                }"

                placeholder="0"

              >

            </div>


            <!-- IMAGE -->

            <div
              class="modalField"
            >


              <label>

                Image

              </label>


              <div
                class="imagePicker"
              >


                <img

                  id="modalImagePreview"

                  class="imagePreview"

                  src="${
                    escapeHTML(
                      existing?.image_url ||
                      ''
                    )
                  }"

                  style="${
                    existing?.image_url
                      ? ''
                      : 'display:none'
                  }"

                  alt=
                    "Product preview"

                >


                <div

                  id="modalImageEmpty"

                  class="imageEmpty"

                  style="${
                    existing?.image_url
                      ? 'display:none'
                      : ''
                  }"

                >

                  No image selected

                </div>


                <input

                  id="modalProductImage"

                  type="file"

                  accept="image/*"

                  class="modalInput"

                >


              </div>


            </div>


            <!-- DESCRIPTION -->

            <div
              class="modalField full"
            >


              <label
                for=
                  "modalProductDescription"
              >

                Description

              </label>


              <textarea

                id=
                  "modalProductDescription"

                class="modalTextarea"

                placeholder=
                  "Product description"

              >${
                escapeHTML(
                  existing?.description ||
                  ''
                )
              }</textarea>


            </div>


          </div>


          <!-- ACTION BUTTONS -->

          <div
            class="modalActions"
          >


            <button

              type="button"

              class="
                modalBtn
                modalCancel
              "

              id=
                "productModalCancel"

            >

              Cancel

            </button>


            <button

              type="submit"

              class="
                modalBtn
                modalSave
              "

              id=
                "productModalSave"

            >

              ${
                existing
                  ? 'Save Changes'
                  : 'Add Product'
              }

            </button>


          </div>


        </form>


      </div>

    `;


    document.body.appendChild(
      overlay
    );


    // ======================================
    // CLOSE MODAL
    // ======================================

    let modalClosed =
      false;


    const closeModal =
      () => {


        if (modalClosed) {
          return;
        }


        modalClosed =
          true;


        document.removeEventListener(
          'keydown',
          escapeHandler
        );


        overlay.remove();

      };


    $('productModalClose')
      .onclick =
      closeModal;


    $('productModalCancel')
      .onclick =
      closeModal;


    // Close on backdrop click

    overlay.addEventListener(
      'click',
      event => {

        if (
          event.target ===
          overlay
        ) {

          closeModal();

        }

      }
    );


    // ======================================
    // ESCAPE KEY
    // ======================================

    const escapeHandler =
      event => {


        if (
          event.key ===
          'Escape'
        ) {

          closeModal();

        }

      };


    document.addEventListener(
      'keydown',
      escapeHandler
    );


    // ======================================
    // IMAGE PREVIEW
    // ======================================

    $('modalProductImage')
      .addEventListener(
        'change',
        event => {


          const file =
            event.target.files?.[0];


          if (!file) {
            return;
          }


          if (
            !file.type.startsWith(
              'image/'
            )
          ) {


            event.target.value =
              '';


            return toast(
              'Please select an image file'
            );

          }


          const preview =
            $('modalImagePreview');


          const empty =
            $('modalImageEmpty');


          preview.src =
            URL.createObjectURL(
              file
            );


          preview.style.display =
            'block';


          empty.style.display =
            'none';

        }
      );


    // ======================================
    // SAVE PRODUCT
    // ======================================

    $('productModalForm')
      .addEventListener(
        'submit',
        async event => {


          event.preventDefault();


          const name =
            $('modalProductName')
              .value
              .trim();


          const category =
            $('modalProductCategory')
              .value;


          const price =
            Number(
              $('modalProductPrice')
                .value
            );


          const stock =
            Number(
              $('modalProductStock')
                .value
            );


          const description =
            $('modalProductDescription')
              .value
              .trim();


          const file =
            $('modalProductImage')
              .files?.[0] ||
            null;


          const saveButton =
            $('productModalSave');


          // VALIDATION

          if (!name) {

            return toast(
              'Product name required'
            );

          }


          if (
            !validCategories
              .includes(
                category
              )
          ) {

            return toast(
              'Invalid category'
            );

          }


          if (
            !Number.isFinite(
              price
            ) ||
            price < 0
          ) {

            return toast(
              'Invalid price'
            );

          }


          if (
            !Number.isInteger(
              stock
            ) ||
            stock < 0
          ) {

            return toast(
              'Invalid stock'
            );

          }


          saveButton.disabled =
            true;


          saveButton.textContent =
            file
              ? 'Uploading image...'
              : 'Saving...';


          try {


            let imageUrl =
              existing?.image_url ||
              null;


            // ==================================
            // ADD NEW PRODUCT
            // ==================================

            if (!id) {


              const {
                data: newProduct,
                error: createError
              } =
                await db
                  .from('products')
                  .insert({

                    name,

                    category,

                    description,

                    price,

                    stock

                  })
                  .select()
                  .single();


              if (createError) {
                throw createError;
              }


              // Upload image after product ID exists

              if (file) {


                imageUrl =
                  await uploadProductImage(
                    file,
                    newProduct.id
                  );


                if (!imageUrl) {

                  throw new Error(
                    'Image upload failed'
                  );

                }


                const {
                  error:
                    imageUpdateError
                } =
                  await db
                    .from('products')
                    .update({

                      image_url:
                        imageUrl

                    })
                    .eq(
                      'id',
                      newProduct.id
                    );


                if (
                  imageUpdateError
                ) {

                  throw imageUpdateError;

                }

              }


              closeModal();


              await loadProducts();


              await DLproducts();


              toast(
                'Product added successfully'
              );


              return;

            }


            // ==================================
            // UPDATE EXISTING PRODUCT
            // ==================================

            if (file) {


              imageUrl =
                await uploadProductImage(
                  file,
                  id
                );


              if (!imageUrl) {

                throw new Error(
                  'Image upload failed'
                );

              }

            }


            const payload = {

              name,

              category,

              description,

              price,

              stock,

              image_url:
                imageUrl

            };


            const {
              error
            } =
              await db
                .from('products')
                .update(
                  payload
                )
                .eq(
                  'id',
                  id
                );


            if (error) {
              throw error;
            }


            closeModal();


            await loadProducts();


            await DLproducts();


            toast(
              'Product saved successfully'
            );


          } catch (error) {


            console.error(
              'Product save error:',
              error
            );


            toast(
              'Product save failed: ' +
              (
                error.message ||
                error
              )
            );


            saveButton.disabled =
              false;


            saveButton.textContent =
              existing
                ? 'Save Changes'
                : 'Add Product';

          }

        }
      );


    // Focus product name

    $('modalProductName')
      .focus();

  };


// ==========================================
// DELETE PRODUCT
// ==========================================

window.DLdelete =
  async function(id) {


    if (
      !confirm(
        'Delete this product?'
      )
    ) {

      return;

    }


    const {
      error
    } =
      await db
        .from('products')
        .delete()
        .eq(
          'id',
          id
        );


    if (error) {


      console.error(
        'Delete error:',
        error
      );


      return toast(
        'Delete failed: ' +
        error.message
      );

    }


    // Remove deleted product from cart

    cart =
      cart.filter(
        item =>
          item.id !== id
      );


    updateCart();

    renderPageCart();


    await loadProducts();


    toast(
      'Product deleted'
    );


    await DLproducts();

  };


// ==========================================
// FIX CONTACT DETAILS
// ==========================================

function setupContact() {


  const contactCard =
    document.querySelector(
      '#page-contact .contactCard'
    );


  if (!contactCard) {
    return;
  }


  const paragraphs =
    contactCard.querySelectorAll(
      'p'
    );


  if (paragraphs[2]) {


    paragraphs[2].innerHTML = `

      📞 Call / WhatsApp:

      <b>
        +91 8295993117
      </b>

      <br>

      📍 Haryana, India

    `;

  }


  const button =
    contactCard.querySelector(
      'button'
    );


  if (button) {


    button.onclick =
      () => {


        window.open(

          'https://wa.me/' +
          WHATSAPP_NUMBER,

          '_blank'

        );

      };

  }

}


// ==========================================
// START APP
// ==========================================

document.addEventListener(
  'DOMContentLoaded',
  async () => {


    setupContact();


    await loadProducts();


    updateCart();

  }
);