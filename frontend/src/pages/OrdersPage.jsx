import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import client, { errorMessage } from "../api/client.js";
import Loading from "../components/Loading.jsx";
import { formatDate, formatMoney } from "../utils/format.js";

export default function OrdersPage() {
  const { t, i18n } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const load = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    try {
      const { data } = await client.get("/orders?limit=100");
      setOrders(data.data);
    } catch (error) {
      setNotice(errorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    load();
    const interval = setInterval(() => load(true), 10000);
    return () => clearInterval(interval);
  }, [load]);
  const action = async (url, body) => {
    try {
      setNotice("");
      await client.patch(url, body);
      await load(true);
    } catch (error) {
      setNotice(errorMessage(error));
    }
  };
  const pay = async (id) => {
    try {
      await client.post(`/orders/${id}/pay`, { simulate: "success" });
      await load(true);
    } catch (error) {
      setNotice(errorMessage(error));
    }
  };
  if (loading) return <Loading />;
  return (
    <section className="page section">
      <div className="container narrow">
        <div className="section-heading">
          <div>
            <span className="eyebrow">ORDER HISTORY</span>
            <h1>{t("orders.title")}</h1>
            <p>{t("orders.track")}</p>
          </div>
        </div>
        {notice && <div className="notice error">{notice}</div>}
        {!orders.length ? (
          <div className="empty-state">
            <h2>{t("orders.empty")}</h2>
            <Link className="button primary" to="/menu">
              {t("cart.browse")}
            </Link>
          </div>
        ) : (
          <div className="order-list">
            {orders.map((order) => (
              <article className="order-card" key={order._id}>
                <header>
                  <div>
                    <strong>
                      {t("orders.order")} #{order._id.slice(-7).toUpperCase()}
                    </strong>
                    <small>{formatDate(order.createdAt, i18n.language)}</small>
                  </div>
                  <span
                    className={`status status-${order.orderStatus.toLowerCase().replaceAll(" ", "-")}`}
                  >
                    {order.orderStatus}
                  </span>
                </header>
                <div className="order-products">
                  {order.items.map((item) => (
                    <div key={item.product}>
                    <img src={item.image.secure_url} alt="" />
                      <span>
                        {item.quantity} × {item.name}
                      </span>
                    </div>
                  ))}
                </div>
                <footer>
                  <div>
                    <small>
                      {t("orders.payment")}: {order.paymentStatus} ·{" "}
                      {order.paymentMethod}
                    </small>
                    <strong>
                      {formatMoney(order.totalPrice, i18n.language)}
                    </strong>
                  </div>
                  <div className="order-actions">
                    {order.paymentMethod === "ONLINE" &&
                      order.paymentStatus !== "Paid" &&
                      order.orderStatus !== "Cancelled" && (
                        <button
                          className="button small primary"
                          onClick={() => pay(order._id)}
                        >
                          {t("orders.pendingPayment")}
                        </button>
                      )}
                    {["Pending", "Confirmed"].includes(order.orderStatus) && (
                      <button
                        className="button small ghost danger"
                        onClick={() => action(`/orders/${order._id}/cancel`)}
                      >
                        {t("orders.cancel")}
                      </button>
                    )}
                  </div>
                </footer>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
