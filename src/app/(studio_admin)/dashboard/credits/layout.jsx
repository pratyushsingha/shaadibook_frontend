import Script from "next/script";

export default function CreditLayout({ children }) {
  return (
    <>
      <script src="https://sdk.cashfree.com/js/v3/cashfree.js"></script>
      {children}
    </>
  );
}
