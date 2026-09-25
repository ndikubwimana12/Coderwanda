import { useEffect, useState } from "react";
import {
  Edit3,
  Plus,
  Save,
  X,
  Wrench,
} from "lucide-react";

import api from "../../Utils/api";

const emptyForm = {
  title: "",
  category: "Development",
  short_description: "",
  description: "",
  image: "",
  icon: "",
  features: "",
};

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);

      const { data } = await api.get("/admin/services");

      setServices(data);
    } catch (error) {
      setMessage(
        error.response?.data?.error ||
        "Unable to load services."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openForm = (service = null) => {
    setEditingId(service?.id || null);

    setForm(
      service
        ? {
          title: service.title || "",
          category: service.category || "Development",
          short_description:
            service.short_description || "",
          description: service.description || "",
          image: service.image || "",
          icon: service.icon || "",
          features: Array.isArray(service.features)
            ? service.features.join(", ")
            : service.features || "",
        }
        : emptyForm
    );

    setShowForm(true);
    setMessage("");
  };

  const submit = async (event) => {
    event.preventDefault();

    const payload = {
      ...form,
      features: form.features
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    };

    try {
      if (editingId) {
        await api.put(
          `/admin/services/${editingId}`,
          payload
        );

        setMessage("Service updated successfully.");
      } else {
        await api.post(
          "/admin/services",
          payload
        );

        setMessage("Service created successfully.");
      }

      setShowForm(false);
      setForm(emptyForm);
      setEditingId(null);

      load();
    } catch (error) {
      setMessage(
        error.response?.data?.error ||
        "Unable to save service."
      );
    }
  };

  const disable = async (id) => {
    if (
      !window.confirm(
        "Disable this service on public pages?"
      )
    ) {
      return;
    }

    try {
      await api.delete(`/admin/services/${id}`);

      setMessage("Service disabled successfully.");

      load();
    } catch (error) {
      setMessage(
        error.response?.data?.error ||
        "Unable to disable service."
      );
    }
  };

  return (
    <div className="space-y-6">

      {/* =====================================================
                HEADER
            ====================================================== */}

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

        <div>
          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-700">
              <Wrench size={20} />
            </div>

            <div>
              <h1 className="text-2xl font-extrabold text-slate-950">
                Services
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Manage services offered by CodeRwanda.
              </p>
            </div>

          </div>
        </div>

        <button
          onClick={() => openForm()}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-purple-800 active:scale-95"
        >
          <Plus size={17} />
          Add Service
        </button>

      </div>


      {/* =====================================================
                MESSAGE
            ====================================================== */}

      {message && (
        <div className="rounded-xl border border-purple-100 bg-purple-50 px-4 py-3 text-sm font-semibold text-purple-800">
          {message}
        </div>
      )}


      {/* =====================================================
                FORM
            ====================================================== */}

      {showForm && (
        <form
          onSubmit={submit}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >

          <div className="mb-6 flex items-center justify-between">

            <div>
              <h2 className="text-lg font-extrabold text-slate-950">
                {editingId
                  ? "Edit Service"
                  : "Create Service"}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Add or update a service displayed
                on the CodeRwanda website.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setForm(emptyForm);
                setEditingId(null);
              }}
              className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            >
              <X size={18} />
            </button>

          </div>


          <div className="grid gap-5 md:grid-cols-2">

            {/* Title */}

            <label className="text-sm font-bold text-slate-700">
              Service Title

              <input
                required
                type="text"
                value={form.title}
                onChange={(event) =>
                  setForm({
                    ...form,
                    title: event.target.value,
                  })
                }
                placeholder="Web Development"
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-normal text-slate-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
              />
            </label>


            {/* Category */}

            <label className="text-sm font-bold text-slate-700">
              Category

              <select
                value={form.category}
                onChange={(event) =>
                  setForm({
                    ...form,
                    category: event.target.value,
                  })
                }
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-normal text-slate-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
              >
                <option value="Development">
                  Development
                </option>

                <option value="Consulting">
                  Consulting
                </option>

                <option value="Training">
                  Training
                </option>

                <option value="Technology">
                  Technology
                </option>

                <option value="Cybersecurity">
                  Cybersecurity
                </option>
              </select>
            </label>


            {/* Short Description */}

            <label className="text-sm font-bold text-slate-700 md:col-span-2">
              Short Description

              <input
                required
                type="text"
                value={form.short_description}
                onChange={(event) =>
                  setForm({
                    ...form,
                    short_description:
                      event.target.value,
                  })
                }
                placeholder="A short description for service cards..."
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-normal text-slate-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
              />
            </label>


            {/* Full Description */}

            <label className="text-sm font-bold text-slate-700 md:col-span-2">
              Full Description

              <textarea
                required
                rows={5}
                value={form.description}
                onChange={(event) =>
                  setForm({
                    ...form,
                    description:
                      event.target.value,
                  })
                }
                placeholder="Describe this service in detail..."
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-normal text-slate-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
              />
            </label>


            {/* Image */}

            <label className="text-sm font-bold text-slate-700">
              Image URL

              <input
                type="text"
                value={form.image}
                onChange={(event) =>
                  setForm({
                    ...form,
                    image: event.target.value,
                  })
                }
                placeholder="/images/services/web.jpg"
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-normal text-slate-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
              />
            </label>


            {/* Icon */}

            <label className="text-sm font-bold text-slate-700">
              Icon Class

              <input
                type="text"
                value={form.icon}
                onChange={(event) =>
                  setForm({
                    ...form,
                    icon: event.target.value,
                  })
                }
                placeholder="Code2"
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-normal text-slate-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
              />
            </label>


            {/* Features */}

            <label className="text-sm font-bold text-slate-700 md:col-span-2">
              Features

              <input
                type="text"
                value={form.features}
                onChange={(event) =>
                  setForm({
                    ...form,
                    features:
                      event.target.value,
                  })
                }
                placeholder="React, Node.js, MySQL, REST APIs"
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-normal text-slate-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
              />

              <span className="mt-1 block text-xs font-normal text-slate-400">
                Separate each feature with a comma.
              </span>
            </label>

          </div>


          {/* Form Actions */}

          <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-5">

            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setForm(emptyForm);
                setEditingId(null);
              }}
              className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-purple-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-purple-800"
            >
              <Save size={16} />

              {editingId
                ? "Update Service"
                : "Create Service"}
            </button>

          </div>

        </form>
      )}


      {/* =====================================================
                SERVICES
            ====================================================== */}

      <div>

        <div className="mb-4 flex items-center justify-between">

          <div>
            <h2 className="text-lg font-extrabold text-slate-950">
              Service Catalog
            </h2>

            <p className="text-sm text-slate-500">
              {services.length} service
              {services.length !== 1
                ? "s"
                : ""}{" "}
              managed in the system.
            </p>
          </div>

        </div>


        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
            <p className="text-sm font-semibold text-slate-500">
              Loading services...
            </p>
          </div>
        ) : services.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-purple-50 text-purple-700">
              <Wrench size={24} />
            </div>

            <h3 className="mt-4 font-bold text-slate-900">
              No services yet
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Create your first CodeRwanda service.
            </p>

            <button
              onClick={() => openForm()}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-purple-700 px-5 py-3 text-sm font-bold text-white hover:bg-purple-800"
            >
              <Plus size={16} />
              Add Service
            </button>

          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

            {services.map((service) => (
              <article
                key={service.id}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-purple-200 hover:shadow-xl"
              >

                {/* Image */}

                {service.image ? (
                  <div className="h-44 overflow-hidden bg-slate-100">
                    <img
                      src={service.image}
                      alt={service.title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="flex h-44 items-center justify-center bg-purple-50 text-purple-300">
                    <Wrench size={42} />
                  </div>
                )}


                <div className="p-5">

                  <div className="flex items-start justify-between gap-3">

                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-purple-600">
                        {service.category}
                      </span>

                      <h3 className="mt-1 text-lg font-extrabold text-slate-950">
                        {service.title}
                      </h3>
                    </div>


                    <div className="flex gap-1">

                      <button
                        title="Edit service"
                        onClick={() =>
                          openForm(
                            service
                          )
                        }
                        className="rounded-lg p-2 text-slate-500 transition hover:bg-purple-50 hover:text-purple-700"
                      >
                        <Edit3 size={16} />
                      </button>

                      <button
                        title="Disable service"
                        onClick={() =>
                          disable(
                            service.id
                          )
                        }
                        className="rounded-lg p-2 text-rose-500 transition hover:bg-rose-50 hover:text-rose-700"
                      >
                        <X size={16} />
                      </button>

                    </div>

                  </div>


                  <p className="mt-3 text-sm leading-6 text-slate-500">
                    {service.short_description ||
                      service.description}
                  </p>


                  {service.features && (
                    <div className="mt-4 flex flex-wrap gap-2">

                      {(Array.isArray(
                        service.features
                      )
                        ? service.features
                        : service.features
                          .split(",")
                      ).map(
                        (
                          feature,
                          index
                        ) => (
                          <span
                            key={
                              index
                            }
                            className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600"
                          >
                            {feature}
                          </span>
                        )
                      )}

                    </div>
                  )}

                </div>

              </article>
            ))}

          </div>
        )}

      </div>

    </div>
  );
}