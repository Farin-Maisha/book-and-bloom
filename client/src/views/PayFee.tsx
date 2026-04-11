import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ApiClient from "../api";
import toast from "react-hot-toast";

const apiClient = new ApiClient();

export default function PayFee() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(window.location.search);
  const userId = (location.state as any)?.userId || params.get('userId');
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    if (!userId) {
      toast.error("Session expired. Please log in again.");
      navigate("/login");
      return;
    }

    setLoading(true);
    const data = await apiClient.payFee(Number(userId));
    setLoading(false);

    if (data?.token) {
      localStorage.setItem("token", data.token);
      toast.success("Payment successful! Welcome to the library! 🎉");
      navigate("/");
    } else {
      toast.error(data?.message || "Payment failed. Please try again.");
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center py-5"
         style={{ backgroundColor: "#fdf6ec", minHeight: "80vh" }}>
      <div className="p-4 text-center"
           style={{ border: "2px solid #222", borderRadius: "1.5rem",
                    width: "380px", backgroundColor: "#fff" }}>

        <div className="mx-auto mb-3 rounded-circle d-flex align-items-center justify-content-center"
             style={{ width: "70px", height: "70px", backgroundColor: "#f5c5c5",
                      fontSize: "2rem", border: "2px solid #222" }}>
          💳
        </div>

        <h5 className="mb-1">Registration Fee</h5>
        <p className="text-muted mb-4" style={{ fontSize: "0.9rem" }}>
          A one-time registration fee is required to access the library.
        </p>

        <div className="p-3 mb-4 rounded"
             style={{ backgroundColor: "#fdf6ec", border: "1px dashed #e0a0a0" }}>
          <div className="d-flex justify-content-between mb-2">
            <span className="text-muted">Library Membership</span>
            <strong>৳ 500.00</strong>
          </div>
          <div className="d-flex justify-content-between mb-2">
            <span className="text-muted">Access Duration</span>
            <strong>1 Year</strong>
          </div>
          <hr className="my-2" />
          <div className="d-flex justify-content-between">
            <strong>Total</strong>
            <strong style={{ color: "#b05a7a" }}>৳ 500.00</strong>
          </div>
        </div>

        <p className="text-muted mb-3" style={{ fontSize: "0.8rem" }}>
          🔒 Secure payment — clicking below marks your account as paid (demo mode).
          Wire up Stripe or bKash here for real transactions.
        </p>

        <button className="btn w-100 py-2"
                style={{ backgroundColor: "#f5c5c5", border: "1px solid #e0a0a0" }}
                onClick={handlePay} disabled={loading}>
          {loading ? "Processing..." : "PAY ৳ 500 & ENTER LIBRARY"}
        </button>
      </div>
    </div>
  );
}