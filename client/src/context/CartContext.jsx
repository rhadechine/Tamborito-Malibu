import {
  createContext,
  useContext,
  useMemo,
  useState,
} from 'react';

const CART_KEY = 'tamborito.cart.v2';

function readCart() {
  try {
    const value = localStorage.getItem(CART_KEY);

    return value ? JSON.parse(value) : [];
  } catch {
    return [];
  }
}

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(readCart);

  function persist(nextItems) {
    setItems(nextItems);

    localStorage.setItem(
      CART_KEY,
      JSON.stringify(nextItems),
    );
  }

  function addCourse(course) {
    if (course.isFree) {
      return {
        ok: false,
        message:
          'Los cursos gratuitos se inscriben directamente.',
      };
    }

    if (
      items.some((item) => item.id === course.id)
    ) {
      return {
        ok: false,
        message:
          'Este curso ya se encuentra en el carrito.',
      };
    }

    persist([
      ...items,
      {
        id: course.id,
        slug: course.slug,
        title: course.title,
        category: course.category,
        cover: course.cover,
        price: course.price,
      },
    ]);

    return {
      ok: true,
      message: 'Curso agregado al carrito.',
    };
  }

  function removeCourse(courseId) {
    persist(
      items.filter((item) => item.id !== courseId),
    );
  }

  function clearCart() {
    persist([]);
  }

  const total = useMemo(
    () =>
      items.reduce(
        (sum, item) =>
          sum + Number(item.price || 0),
        0,
      ),
    [items],
  );

  const value = {
    items,
    count: items.length,
    total,
    addCourse,
    removeCourse,
    clearCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      'useCart debe utilizarse dentro de CartProvider.',
    );
  }

  return context;
}