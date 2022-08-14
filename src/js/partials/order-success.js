
const quantitySelect = {
    template: `<div class="quantity-select">
            <button class="quantity-select__button" @click="decValue()" :disabled="modelValue<=min">-</button>
            <div class="quantity-select__value">{{ modelValue }}</div>
            <button class="quantity-select__button" @click="incValue()" :disabled="modelValue>=max">+</button>
        </div>`,
    props: ['modelValue', 'min', 'max'],
    emits: ['update:modelValue'],
    methods: {
        incValue: function () {
            this.applyValue(this.modelValue + 1);
        },
        decValue: function () {
            this.applyValue(this.modelValue - 1);
        },
        applyValue: function(val) {
            this.$emit('update:modelValue', val);
        }
    }
};

const orderApp = {
    data() {
        return {
            active: false,
            orderNumber: null,
            popupOpen: false,
            cartItems: [],
            items: [],
            maxQuantity: 99,
            cartHovered: false,
            popup: {
                added: false,
                complete: false,
            },
        }
    },
    mounted() {
        shop.additionalProducts((response) => {
            this.items = response.items.map(i => {
                i.quantity = 1;
                return i;
            });
        });
        this.updateOrderNumber();
    },
    computed: {
        isShowCartEmpty() {
            return this.cartHovered && this.isCartEmpty;
        },
        isShowCartPopup() {
            return this.popupOpen && ! this.isCartEmpty;
        },
        isCartEmpty() {
            return this.cartItemsCount === 0;
        },
        cartItemsCount() {
            return this.cartItems.length;
        },
        cartItemsTotal() {
            return this.cartItems.reduce((acc, i) => acc + this.stackPrice(i), 0);
        },
    },
    methods: {
        updateOrderNumber() {
            const match = window.location.search.match(/order=([^&]+)/);
            if (match) {
                this.orderNumber = decodeURIComponent(match[1]);
                this.active = true;
            }
        },
        stackPrice(item) {
            return item.quantity * item.price;
        },
        getCartItem(item) {
            return this.cartItems.filter(i => i.code === item.code)[0];
        },
        deleteFromCart(item) {
            this.cartItems = this.cartItems.filter(i => i.code !== item.code)
        },
        addToCart(item) {
            const cartItem = this.getCartItem(item);
            if (cartItem) {
                cartItem.quantity += item.quantity;
                if (cartItem.quantity > this.maxQuantity) {
                    cartItem.quantity = this.maxQuantity;
                }
            } else {
                this.cartItems.push(Object.assign({}, item));
            }
            this.openPopup('added');
        },
        togglePopup() {
            this.popupOpen = ! this.popupOpen;
        },
        openPopup(name) {
            this.closePopup();
            this.popup[name] = true;
        },
        closePopup() {
            for (let name in this.popup) {
                this.popup[name] = false;
            }
        },
        makeOrder() {
            let cart = {};
            this.cartItems.forEach((item) => {
                cart[item.code] = item.quantity;
            });

            shop.addToOrder(this.orderNumber, cart, () => {
                this.openPopup('complete')
                this.cartItems = [];
            }, () => {
                alert('Произошла ошибка при добавлении товаров в заказ.');
            })
        },
        docClick(e) {
            if (! this.$refs.cart.contains(e.target)) {
                this.popupOpen = false;
            }
        },
    },
}

function initOrderSuccess() {
    if (document.getElementById('orderSuccessApp')) {
        Vue
            .createApp(orderApp)
            .component('quantityselect', quantitySelect)
            .mount('#orderSuccessApp');
    }
}

$(document).ready(initOrderSuccess);
