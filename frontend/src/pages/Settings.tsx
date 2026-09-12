import { useEffect, useState } from "react";
import {
  Building2,
  Receipt,
  Settings as SettingsIcon,
  Save,
} from "lucide-react";

interface AppSettings {
  businessName: string;
  businessEmail: string;
  phone: string;
  address: string;
  gstNumber: string;

  invoicePrefix: string;
  currency: string;
  invoiceFooter: string;

  defaultPaymentMethod: string;
  lowStockThreshold: number;
}

const defaultSettings: AppSettings = {
  businessName: "RetailFlow",
  businessEmail: "",
  phone: "",
  address: "",
  gstNumber: "",

  invoicePrefix: "INV-",
  currency: "INR",
  invoiceFooter: "Thank you for your business.",

  defaultPaymentMethod: "CASH",
  lowStockThreshold: 10,
};

export default function Settings() {
  const [settings, setSettings] =
    useState<AppSettings>(defaultSettings);

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(
      "retailflow-settings"
    );

    if (stored) {
      try {
        setSettings({
          ...defaultSettings,
          ...JSON.parse(stored),
        });
      } catch {
        console.error(
          "Failed to load saved settings"
        );
      }
    }
  }, []);

  function updateField(
    field: keyof AppSettings,
    value: string | number
  ) {
    setSettings((current) => ({
      ...current,
      [field]: value,
    }));

    setSaved(false);
  }

  function saveSettings(
    e: React.FormEvent
  ) {
    e.preventDefault();

    localStorage.setItem(
      "retailflow-settings",
      JSON.stringify(settings)
    );

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 3000);
  }

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-2xl font-bold text-zinc-900">
          Settings
        </h1>

        <p className="text-sm text-zinc-500 mt-1">
          Configure your RetailFlow application.
        </p>
      </div>

      {saved && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          Settings saved successfully.
        </div>
      )}

      <form
        onSubmit={saveSettings}
        className="space-y-6"
      >

        {/* Business */}

        <div className="bg-white border border-zinc-200 rounded-xl">

          <div className="px-6 py-5 border-b flex items-center gap-3">

            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Building2 size={20} />
            </div>

            <div>
              <h2 className="font-semibold">
                Business Information
              </h2>

              <p className="text-sm text-zinc-500">
                Information about your retail business.
              </p>
            </div>

          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">

            <Field
              label="Business Name"
              value={settings.businessName}
              onChange={(value) =>
                updateField(
                  "businessName",
                  value
                )
              }
            />

            <Field
              label="Business Email"
              value={settings.businessEmail}
              onChange={(value) =>
                updateField(
                  "businessEmail",
                  value
                )
              }
            />

            <Field
              label="Phone"
              value={settings.phone}
              onChange={(value) =>
                updateField("phone", value)
              }
            />

            <Field
              label="GST Number"
              value={settings.gstNumber}
              onChange={(value) =>
                updateField(
                  "gstNumber",
                  value
                )
              }
            />

            <div className="md:col-span-2">

              <label className="block text-sm font-medium mb-2">
                Address
              </label>

              <textarea
                value={settings.address}
                onChange={(e) =>
                  updateField(
                    "address",
                    e.target.value
                  )
                }
                rows={3}
                className="w-full border border-zinc-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />

            </div>

          </div>

        </div>

        {/* Invoice */}

        <div className="bg-white border border-zinc-200 rounded-xl">

          <div className="px-6 py-5 border-b flex items-center gap-3">

            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Receipt size={20} />
            </div>

            <div>
              <h2 className="font-semibold">
                Invoice Settings
              </h2>

              <p className="text-sm text-zinc-500">
                Configure invoice information.
              </p>
            </div>

          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">

            <Field
              label="Invoice Prefix"
              value={settings.invoicePrefix}
              onChange={(value) =>
                updateField(
                  "invoicePrefix",
                  value
                )
              }
            />

            <div>

              <label className="block text-sm font-medium mb-2">
                Currency
              </label>

              <select
                value={settings.currency}
                onChange={(e) =>
                  updateField(
                    "currency",
                    e.target.value
                  )
                }
                className="w-full border border-zinc-300 rounded-lg px-3 py-2.5 bg-white outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="INR">
                  INR (₹)
                </option>

                <option value="USD">
                  USD ($)
                </option>

                <option value="BDT">
                  BDT (৳)
                </option>
              </select>

            </div>

            <div className="md:col-span-2">

              <label className="block text-sm font-medium mb-2">
                Invoice Footer
              </label>

              <textarea
                value={settings.invoiceFooter}
                onChange={(e) =>
                  updateField(
                    "invoiceFooter",
                    e.target.value
                  )
                }
                rows={2}
                className="w-full border border-zinc-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />

            </div>

          </div>

        </div>

        {/* Application */}

        <div className="bg-white border border-zinc-200 rounded-xl">

          <div className="px-6 py-5 border-b flex items-center gap-3">

            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <SettingsIcon size={20} />
            </div>

            <div>
              <h2 className="font-semibold">
                Application Settings
              </h2>

              <p className="text-sm text-zinc-500">
                Configure inventory and payment defaults.
              </p>
            </div>

          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">

            <div>

              <label className="block text-sm font-medium mb-2">
                Default Payment Method
              </label>

              <select
                value={
                  settings.defaultPaymentMethod
                }
                onChange={(e) =>
                  updateField(
                    "defaultPaymentMethod",
                    e.target.value
                  )
                }
                className="w-full border border-zinc-300 rounded-lg px-3 py-2.5 bg-white outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="CASH">
                  Cash
                </option>

                <option value="CARD">
                  Card
                </option>

                <option value="UPI">
                  UPI
                </option>

                <option value="BANK_TRANSFER">
                  Bank Transfer
                </option>
              </select>

            </div>

            <div>

              <label className="block text-sm font-medium mb-2">
                Low Stock Threshold
              </label>

              <input
                type="number"
                min="0"
                value={
                  settings.lowStockThreshold
                }
                onChange={(e) =>
                  updateField(
                    "lowStockThreshold",
                    Number(e.target.value)
                  )
                }
                className="w-full border border-zinc-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
              />

            </div>

          </div>

        </div>

        {/* Save */}

        <div className="flex justify-end">

          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Save size={18} />
            Save Settings
          </button>

        </div>

      </form>

    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>

      <label className="block text-sm font-medium mb-2">
        {label}
      </label>

      <input
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className="w-full border border-zinc-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
      />

    </div>
  );
}