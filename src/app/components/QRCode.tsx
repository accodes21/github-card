import QRCode from "react-qr-code";
import React from "react";

interface QRCodeDivProps {
  value: string;
}

const QRCodeDiv: React.FC<QRCodeDivProps> = ({ value }) => {
  return (
    <div
      className="border border-[#deaf56] p-1 qrcode"
      style={{ height: "auto", margin: "0 auto", maxWidth: 144, width: "100%" }}
    >
      <QRCode
        size={256}
        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
        value={value}
        viewBox="0 0 256 256"
      />
    </div>
  );
};

export default QRCodeDiv;
