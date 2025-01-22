import Script from "next/script";

export default function CreditLayout({ children }) {
  return (
    <>
      <Script
        src="https://sdk.cashfree.com/js/v3/cashfree.js"
      />
      {children}
    </>
  );
}
