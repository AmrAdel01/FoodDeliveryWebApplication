import { Minus, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { errorMessage } from "../api/client.js";
import Loading from "../components/Loading.jsx";
import { useCart } from "../context/CartContext.jsx";
import { formatMoney } from "../utils/format.js";

export default function CartPage() {
  const { t, i18n } = useTranslation();
  const { cart, loading, updateItem, removeItem, clear } = useCart();
  const [notice, setNotice] = useState("");
  const run = async (action) => {
    try {
      setNotice("");
      await action();
    } catch (error) {
      setNotice(errorMessage(error));
    }
  };
  if (loading) return <Loading />;
  return (
    <section className="page section">
      <div className="container">
        <div className="section-heading">
          <div>
            <span className="eyebrow">YOUR SELECTION</span>
            <h1>{t("cart.title")}</h1>
          </div>
          {cart.items.length > 0 && (
            <button className="text-button danger" onClick={() => run(clear)}>
              {t("cart.clear")}
            </button>
          )}
        </div>
        {notice && <div className="notice error">{notice}</div>}
        {!cart.items.length ? (
          <div className="empty-state">
            <ShoppingIllustration />
            <h2>{t("cart.empty")}</h2>
            <Link className="button primary" to="/menu">
              {t("cart.browse")}
            </Link>
          </div>
        ) : (
          <div className="cart-layout">
            <div className="cart-items">
              {cart.items.map((item) => (
                <article className="cart-item" key={item.product._id}>
                  <img src={item.product.image.secure_url} alt={item.product.name} />
                  <div className="cart-item-info">
                    <div>
                      <h3>{item.product.name}</h3>
                      <small>{item.product.category}</small>
                    </div>
                    <strong>
                      {formatMoney(
                        item.unitPrice * item.quantity,
                        i18n.language,
                      )}
                    </strong>
                  </div>
                  <div className="quantity compact">
                    <button
                      onClick={() =>
                        item.quantity === 1
                          ? run(() => removeItem(item.product._id))
                          : run(() =>
                              updateItem(item.product._id, item.quantity - 1),
                            )
                      }
                    >
                      <Minus size={15} />
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() =>
                        run(() =>
                          updateItem(item.product._id, item.quantity + 1),
                        )
                      }
                    >
                      <Plus size={15} />
                    </button>
                  </div>
                  <button
                    className="icon-button subtle"
                    onClick={() => run(() => removeItem(item.product._id))}
                    aria-label={t("cart.remove")}
                  >
                    <Trash2 size={18} />
                  </button>
                </article>
              ))}
            </div>
            <aside className="summary-card">
              <h2>{t("checkout.summary")}</h2>
              <SummaryRow
                label={t("cart.subtotal")}
                value={formatMoney(cart.totalPrice, i18n.language)}
              />
              <SummaryRow label={t("cart.delivery")} value={t("cart.free")} />
              <hr />
              <SummaryRow
                label={t("cart.total")}
                value={formatMoney(cart.totalPrice, i18n.language)}
                strong
              />
              <Link className="button primary wide" to="/checkout">
                {t("cart.checkout")}
              </Link>
            </aside>
          </div>
        )}
      </div>
    </section>
  );
}

function SummaryRow({ label, value, strong }) {
  return (
    <div className={strong ? "summary-row strong" : "summary-row"}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
function ShoppingIllustration() {
  return <div className="empty-icon">T</div>;
}
