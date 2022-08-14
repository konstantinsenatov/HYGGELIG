
const registrationApp = {
    data() {
        return {
            isRegistered: false,
            // isRegistered: true,
            user: {
                name: '',
                phone: '',
                serialNumber: '',
            },
            product: {
                serialNumber: null,
                comment: null,
                rows: [], // {name, value}
            },
        }
    },
    mounted() {
        initPhoneMask(this.$refs.phone);
        this.initSerialMask(this.$refs.serial);
    },
    methods: {
        initSerialMask(el) {
            if (! ('IMask' in window)) {
                console.warn('no IMask lib');
                return;
            }
            IMask(el, {
                mask: 'HG.00.000.000000',
            });
        },
        register(e) {
            e.preventDefault();
            const data = Object.assign({}, this.user);
            console.log(data);

            shop.registerProduct(data, (response) => {
                this.product.serialNumber = response.serialNumber;
                this.product.comment = response.comment;
                this.product.rows = response.rows;
                this.isRegistered = true;

            }, (response) => {
                let error = response.error || 'Регистрация не удалась';
                alert(error);
            });

        },
    },
}


function initRegistrationApp() {
    if (document.getElementById('registrationApp')) {
        Vue.createApp(registrationApp).mount('#registrationApp');
    }
}

$(document).ready(initRegistrationApp);
