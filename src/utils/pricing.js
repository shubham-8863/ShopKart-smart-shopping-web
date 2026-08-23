// Helper utility for currency formatting and order calculations

export function formatPrice(amount) {
  return typeof amount === 'number'
    ? new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
      }).format(amount)
    : amount;
}

export function calculateOrderTotals(cartItems = [], products = []) {
  const resolvedItems = cartItems
    .map((item) => ({
      ...item,
      product: products.find((p) => p.id === Number(item.productId)),
    }))
    .filter((item) => Boolean(item.product));

  const subtotal = resolvedItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const isFreeDelivery = subtotal >= 2000;
  const deliveryCost = resolvedItems.length > 0 ? (isFreeDelivery ? 0 : 99) : 0;
  const total = subtotal + deliveryCost;

  return {
    resolvedItems,
    subtotal,
    isFreeDelivery,
    deliveryCost,
    total,
  };
}
