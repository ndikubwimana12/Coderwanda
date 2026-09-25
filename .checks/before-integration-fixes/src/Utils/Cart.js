const CART_KEY = "coderwanda_cart";

export const getCart = () => {
    try {
        const cart = localStorage.getItem(CART_KEY);
        return cart ? JSON.parse(cart) : [];
    } catch (error) {
        console.error("Failed to load cart:", error);
        return [];
    }
};

export const saveCart = (cart) => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));

    // Notify other components that the cart changed
    window.dispatchEvent(new Event("cartUpdated"));
};

export const addToCart = (product) => {
    const cart = getCart();

    const existingProduct = cart.find(
        (item) => item.id === product.id
    );

    let updatedCart;

    if (existingProduct) {
        updatedCart = cart.map((item) =>
            item.id === product.id
                ? {
                    ...item,
                    quantity: item.quantity + 1,
                }
                : item
        );
    } else {
        updatedCart = [
            ...cart,
            {
                ...product,
                quantity: 1,
            },
        ];
    }

    saveCart(updatedCart);
};

export const removeFromCart = (productId) => {
    const cart = getCart();

    const updatedCart = cart.filter(
        (item) => item.id !== productId
    );

    saveCart(updatedCart);
};

export const updateQuantity = (productId, quantity) => {
    const cart = getCart();

    // If quantity becomes 0 or less, remove the product
    if (quantity <= 0) {
        removeFromCart(productId);
        return;
    }

    const updatedCart = cart.map((item) =>
        item.id === productId
            ? {
                ...item,
                quantity,
            }
            : item
    );

    saveCart(updatedCart);
};

export const clearCart = () => {
    localStorage.removeItem(CART_KEY);

    window.dispatchEvent(new Event("cartUpdated"));
};

export const getCartTotal = () => {
    const cart = getCart();

    return cart.reduce(
        (total, item) =>
            total + Number(item.price) * Number(item.quantity),
        0
    );
};

export const getCartCount = () => {
    const cart = getCart();

    return cart.reduce(
        (count, item) => count + Number(item.quantity),
        0
    );
};