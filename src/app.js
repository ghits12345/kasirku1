document.addEventListener("alpine:init", () => {
  Alpine.data("products", () => ({
    items: [
      { id: 1, name: "white machine", img: "white machine.jpg", price: 200000 },
      { id: 2, name: "red machine", img: "black machine.jpg", price: 200000 },
      { id: 3, name: "grey machine", img: "grey machine.jpg", price: 200000 },
    ],
  }));

  Alpine.store("cart", {
    items: [],
    total: 0,
    quantity: 0,
    add(newItem) {
      // cek apakah ada barang yang sama di cart
      const cartItem = this.items.find((item) => item.id === newItem.id);

      // jika belum ada /cart kosong
      if (!cartItem) {
        this.items.push({ ...newItem, quantity: 1, total: newItem.price });
        this.quantity++;
        this.total += newItem.price;
      } else {
        //jika barang sudah ada cek apakah barang beda atau sama dengan cart
        this.items = this.items.map((item) => {
          //jika barang berbeda
          if (item.id !== newItem.id) {
            return item;
          } else {
            //jika barang sudah ada tambah quantity dan totalnya
            item.quantity++;
            item.total = item.price * item.quantity;
            this.quantity++;
            this.total += item.price;
            return item;
          }
        });
      }

      console.log(this.total);
    },
    remove(id) {
      //ambil item yang mau diremove berdasarkan id
      const cartItem = this.items.find((item) => item.id === id);

      /// jika item lebih dari 1
      if (cartItem.quantity > 1) {
        //telusuri 1 1
        this.items = this.items.map((item) => {
          //jika bukan barang yang diklik
          if (item.id !== id) {
            return item;
          } else {
            item.quantity--;
            item.total = item.price * quantity;
            this.quantity--;
            this.total -= item.price;
            return item;
          }
        });
      } else if (cartItem.quantity === 1) {
        // jika barangnya sisa 1
        this.items = this.items.filter((item) => item.id !== id);
        this.quantity--;
        this.total -= cartItem.price;
      }
    },
  });
});

// konversi ke rupiah
const rupiah = (number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(number);
};

// form validation
const checkoutButton = document.querySelector(".checkout-button");
checkoutButton.disabled = true;

const form = document.querySelector("#checkoutForm");

checkoutButton.disabled = true;
checkoutButton.classList.add("disabled");

form.addEventListener("input", function () {
  // Cek semua input dalam form
  const inputs = form.querySelectorAll("input");
  let isValid = true;

  // Periksa setiap input
  inputs.forEach((input) => {
    if (!input.value) {
      isValid = false;
    }
  });

  // Enable/disable button berdasarkan validasi
  if (isValid) {
    checkoutButton.disabled = false;
    checkoutButton.classList.remove("disabled");
  } else {
    checkoutButton.disabled = true;
    checkoutButton.classList.add("disabled");
  }
});

// Kirim data ketika tombol checkout diklik
checkoutButton.addEventListener("click", function (e) {
  e.preventDefault();

  // Ambil data form
  const formData = new FormData(form);

  // Tambahkan data cart ke formData
  formData.append("items", JSON.stringify(Alpine.store("cart").items));
  formData.append("total", Alpine.store("cart").total);

  // Convert ke object
  const data = Object.fromEntries(formData);

  // Format pesan
  const message = formatMessage(data);

  // Buka WhatsApp dengan pesan yang sudah diformat
  window.open(`https://wa.me/620000000?text=${encodeURIComponent(message)}`);
});

// Format pesan WhatsApp
const formatMessage = (data) => {
  // Pastikan data.items adalah string JSON yang valid
  const items = typeof data.items === "string" ? JSON.parse(data.items) : data.items;

  return `Data Customer
Nama: ${data.name}
Email: ${data.email}
No HP: ${data.phone}

Data Pesanan:
${items.map((item) => `${item.name} (${item.quantity} x ${rupiah(item.price)}) = ${rupiah(item.total)}`).join("\n")}

TOTAL: ${rupiah(data.total)}

Terima kasih.`;
};
