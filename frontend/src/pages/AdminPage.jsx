import {
  ClipboardList,
  DollarSign,
  Package,
  Pencil,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import client, { errorMessage } from "../api/client.js";
import Loading from "../components/Loading.jsx";
import { formatDate, formatMoney, productImage } from "../utils/format.js";

const categories = ["Pizza", "Burgers", "Pasta", "Drinks", "Desserts"];
const statuses = [
  "Pending",
  "Confirmed",
  "Preparing",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
];
const nextStatuses = {
  Pending: ["Confirmed", "Cancelled"],
  Confirmed: ["Preparing", "Cancelled"],
  Preparing: ["Out for Delivery", "Cancelled"],
  "Out for Delivery": ["Delivered"],
  Delivered: [],
  Cancelled: [],
};
const blankProduct = {
  name: "",
  description: "",
  category: "Pizza",
  imageFile: null,
  price: "",
  stock: "",
  isAvailable: true,
};

export default function AdminPage() {
  const { t, i18n } = useTranslation();
  const [tab, setTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState("");
  const [form, setForm] = useState(null);
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setNotice("");
    try {
      const [statsResult, productsResult, ordersResult] = await Promise.all([
        client.get("/admin/stats"),
        client.get("/admin/products?limit=100"),
        client.get(
          `/admin/orders?limit=100${status ? `&status=${encodeURIComponent(status)}` : ""}`,
        ),
      ]);
      setStats(statsResult.data.data);
      setProducts(productsResult.data.data);
      setOrders(ordersResult.data.data);
    } catch (error) {
      setNotice(errorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [status]);
  useEffect(() => {
    load();
  }, [load]);

  const saveProduct = async (event) => {
    event.preventDefault();
    setNotice("");
    const { _id, image, imageFile, createdAt, updatedAt, ...fields } = form;
    const payload = new FormData();
    Object.entries(fields).forEach(([key, value]) =>
      payload.append(key, String(value)),
    );
    if (imageFile) payload.append("image", imageFile);
    const config = { headers: { "Content-Type": "multipart/form-data" } };
    try {
      if (_id) await client.patch(`/admin/products/${_id}`, payload, config);
      else await client.post("/admin/products", payload, config);
      setForm(null);
      await load();
    } catch (error) {
      setNotice(errorMessage(error));
    }
  };
  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await client.delete(`/admin/products/${id}`);
      await load();
    } catch (error) {
      setNotice(errorMessage(error));
    }
  };
  const updateStatus = async (id, orderStatus) => {
    if (!orderStatus) return;
    try {
      await client.patch(`/admin/orders/${id}/status`, { status: orderStatus });
      await load();
    } catch (error) {
      setNotice(errorMessage(error));
    }
  };

  return (
    <section className="page section admin-page">
      <div className="container">
        <div className="section-heading">
          <div>
            <span className="eyebrow">OPERATIONS</span>
            <h1>{t("admin.title")}</h1>
          </div>
        </div>
        <div className="admin-tabs">
          <button
            className={tab === "overview" ? "active" : ""}
            onClick={() => setTab("overview")}
          >
            Overview
          </button>
          <button
            className={tab === "products" ? "active" : ""}
            onClick={() => setTab("products")}
          >
            {t("admin.manageProducts")}
          </button>
          <button
            className={tab === "orders" ? "active" : ""}
            onClick={() => setTab("orders")}
          >
            {t("admin.monitorOrders")}
          </button>
        </div>
        {notice && <div className="notice error">{notice}</div>}
        {loading ? (
          <Loading />
        ) : (
          <>
            {tab === "overview" && (
              <>
                <div className="stats-grid">
                  <Stat
                    icon={<Users />}
                    label={t("admin.users")}
                    value={stats.totalUsers}
                  />
                  <Stat
                    icon={<ClipboardList />}
                    label={t("admin.orders")}
                    value={stats.totalOrders}
                  />
                  <Stat
                    icon={<DollarSign />}
                    label={t("admin.revenue")}
                    value={formatMoney(stats.totalRevenue, i18n.language)}
                  />
                  <Stat
                    icon={<Package />}
                    label={t("admin.products")}
                    value={stats.totalProducts}
                  />
                </div>
                <div className="admin-panel">
                  <div className="panel-title">
                    <h2>Recent orders</h2>
                    <button
                      className="arrow-link"
                      onClick={() => setTab("orders")}
                    >
                      View all
                    </button>
                  </div>
                  <OrdersTable
                    orders={orders.slice(0, 6)}
                    language={i18n.language}
                    onUpdate={updateStatus}
                  />
                </div>
              </>
            )}
            {tab === "products" && (
              <div className="admin-panel">
                <div className="panel-title">
                  <h2>{t("admin.manageProducts")}</h2>
                  <button
                    className="button primary small"
                    onClick={() => setForm(blankProduct)}
                  >
                    <Plus size={17} />
                    {t("admin.addProduct")}
                  </button>
                </div>
                {form && (
                  <ProductForm
                    form={form}
                    setForm={setForm}
                    onSubmit={saveProduct}
                    onCancel={() => setForm(null)}
                    t={t}
                  />
                )}
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>{t("admin.name")}</th>
                        <th>{t("admin.category")}</th>
                        <th>{t("admin.price")}</th>
                        <th>{t("admin.stock")}</th>
                        <th>{t("admin.available")}</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((product) => (
                        <tr key={product._id}>
                          <td>
                            <div className="table-product">
                              <img src={productImage(product.image)} alt="" />
                              <strong>{product.name}</strong>
                            </div>
                          </td>
                          <td>{product.category}</td>
                          <td>{formatMoney(product.price, i18n.language)}</td>
                          <td>{product.stock}</td>
                          <td>
                            <span
                              className={
                                product.isAvailable
                                  ? "availability yes"
                                  : "availability no"
                              }
                            >
                              {product.isAvailable ? "Yes" : "No"}
                            </span>
                          </td>
                          <td>
                            <div className="row-actions">
                              <button
                                className="icon-button subtle"
                                onClick={() => setForm({ ...product })}
                              >
                                <Pencil size={17} />
                              </button>
                              <button
                                className="icon-button subtle danger"
                                onClick={() => deleteProduct(product._id)}
                              >
                                <Trash2 size={17} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            {tab === "orders" && (
              <div className="admin-panel">
                <div className="panel-title">
                  <h2>{t("admin.monitorOrders")}</h2>
                  <select
                    value={status}
                    onChange={(event) => setStatus(event.target.value)}
                  >
                    <option value="">{t("admin.allStatuses")}</option>
                    {statuses.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </div>
                <OrdersTable
                  orders={orders}
                  language={i18n.language}
                  onUpdate={updateStatus}
                />
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

function Stat({ icon, label, value }) {
  return (
    <article className="stat-card">
      <span>{icon}</span>
      <div>
        <small>{label}</small>
        <strong>{value}</strong>
      </div>
    </article>
  );
}

function OrdersTable({ orders, language, onUpdate }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Order</th>
            <th>Customer</th>
            <th>Date</th>
            <th>Total</th>
            <th>Payment</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order._id}>
              <td>
                <strong>#{order._id.slice(-7).toUpperCase()}</strong>
              </td>
              <td>
                <div>
                  {order.user?.name || "User"}
                  <small className="block">{order.user?.email}</small>
                </div>
              </td>
              <td>{formatDate(order.createdAt, language)}</td>
              <td>{formatMoney(order.totalPrice, language)}</td>
              <td>
                <span
                  className={`payment-status ${order.paymentStatus.toLowerCase()}`}
                >
                  {order.paymentStatus}
                </span>
              </td>
              <td>
                {nextStatuses[order.orderStatus].length ? (
                  <select
                    value={order.orderStatus}
                    onChange={(event) =>
                      onUpdate(order._id, event.target.value)
                    }
                  >
                    <option value={order.orderStatus}>
                      {order.orderStatus}
                    </option>
                    {nextStatuses[order.orderStatus].map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span
                    className={`status status-${order.orderStatus.toLowerCase().replaceAll(" ", "-")}`}
                  >
                    {order.orderStatus}
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!orders.length && <div className="empty-table">No orders found.</div>}
    </div>
  );
}

function ProductForm({ form, setForm, onSubmit, onCancel, t }) {
  const update = (key) => (event) =>
    setForm({
      ...form,
      [key]:
        event.target.type === "checkbox"
          ? event.target.checked
          : event.target.value,
    });
  return (
    <form className="product-form" onSubmit={onSubmit}>
      <div className="panel-title">
        <h3>{t(form._id ? "admin.editProduct" : "admin.addProduct")}</h3>
        <button type="button" className="text-button" onClick={onCancel}>
          {t("admin.cancel")}
        </button>
      </div>
      <div className="form-grid">
        <Input
          label={t("admin.name")}
          value={form.name}
          onChange={update("name")}
        />
        <label className="field">
          <span>{t("admin.category")}</span>
          <select value={form.category} onChange={update("category")}>
            {categories.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <Input
          label={t("admin.price")}
          type="number"
          min="0"
          step="0.01"
          value={form.price}
          onChange={update("price")}
        />
        <Input
          label={t("admin.stock")}
          type="number"
          min="0"
          value={form.stock}
          onChange={update("stock")}
        />
        <Input
          label={t("admin.image")}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          required={!form._id}
          onChange={(event) =>
            setForm({ ...form, imageFile: event.target.files[0] || null })
          }
          full
        />
        <label className="field full">
          <span>{t("admin.description")}</span>
          <textarea
            required
            value={form.description}
            onChange={update("description")}
          />
        </label>
        <label className="check-field">
          <input
            type="checkbox"
            checked={form.isAvailable}
            onChange={update("isAvailable")}
          />
          <span>{t("admin.available")}</span>
        </label>
      </div>
      <button className="button primary">{t("admin.save")}</button>
    </form>
  );
}
function Input({ label, full, ...props }) {
  return (
    <label className={full ? "field full" : "field"}>
      <span>{label}</span>
      <input required {...props} />
    </label>
  );
}
