"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { numberToVietnameseWords } from "@/lib/utils/numberToWords";

export default function DeliveryNotePage() {
  const params = useParams();
  const quotationId = params?.id as string;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!quotationId) return;

    Promise.all([
      fetch(`/api/quotations/${quotationId}`).then(r => r.json()),
      fetch("/api/settings/company").then(r => r.json())
    ])
      .then(([quotationData, companyData]) => {
        setData({ quotation: quotationData, company: companyData });
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [quotationId]);

  useEffect(() => {
    // Automatically trigger print dialog when data is loaded
    if (!loading && data) {
      setTimeout(() => {
        window.print();
      }, 500);
    }
  }, [loading, data]);

  if (loading) {
    return <div className="p-10 text-center">Đang tải dữ liệu...</div>;
  }

  if (!data?.quotation) {
    return <div className="p-10 text-center">Không tìm thấy báo giá.</div>;
  }

  const { quotation, company } = data;
  const customer = quotation.lead?.customer;

  // Flatten all items across all sections to match the screenshot
  const allItems: any[] = [];
  quotation.sections?.forEach((section: any) => {
    section.items?.forEach((item: any) => {
      allItems.push(item);
    });
  });

  const totalQuantity = allItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const totalAmount = allItems.reduce((sum, item) => sum + ((item.quantity || 0) * (item.unitPrice || 0)), 0);
  
  const taxRate = quotation.tax || 0;
  const taxAmount = Math.round(totalAmount * (taxRate / 100));
  const grandTotal = totalAmount + taxAmount; // Usually delivery notes might not include discount or show it separately. Based on the image, we only show Cộng tiền hàng, VAT, Tổng thanh toán.

  const formatVND = (num: number) => new Intl.NumberFormat('vi-VN').format(num);

  return (
    <div className="bg-white text-black print:bg-white min-h-screen">
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
          }
          #delivery-note-print-area, #delivery-note-print-area * {
            visibility: visible;
          }
          #delivery-note-print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 0;
          }
        }
      `}} />

      {/* Hide this print button when printing */}
      <div className="print:hidden p-4 bg-zinc-100 flex justify-center mb-4">
        <button 
          onClick={() => window.print()}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 font-medium"
        >
          In Phiếu Xuất Kho
        </button>
      </div>

      <div id="delivery-note-print-area" className="max-w-[800px] mx-auto p-8 text-[15px] leading-relaxed bg-white" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
        {/* Header */}
        <div className="mb-8">
          <div className="font-bold text-lg uppercase">{company?.name || "CÔNG TY TNHH GIẢI PHÁP CÔNG NGHỆ VIỄN ĐÔNG"}</div>
          <div>{company?.address || "Lô 17 đường 18A, KĐT Lê Hồng Phong 2, Phường Nam Nha Trang, Tỉnh Khánh Hòa, Việt Nam"}</div>
          <div>Tel: {company?.phone || "0258.3874739"} Email: {company?.email || "vd@viendongnhatrang.com"}</div>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-xl font-bold uppercase mb-1">PHIẾU XUẤT KHO BÁN HÀNG</h1>
          <p className="italic text-sm">Ngày {new Date().getDate().toString().padStart(2, '0')} tháng {(new Date().getMonth() + 1).toString().padStart(2, '0')} năm {new Date().getFullYear()}</p>
        </div>

        {/* Info Blocks */}
        <div className="flex justify-between mb-4">
          <div className="flex-1">
            <div>Người mua:</div>
            <div>Tên khách hàng: {customer?.name} {customer?.phone}</div>
            <div>Địa chỉ: {customer?.address || ""}</div>
            <div>Diễn giải: Bán hàng {customer?.name} {customer?.phone}</div>
          </div>
          <div className="w-[200px]">
            <div>Số: PT{quotation.code?.replace(/\D/g, '') || Math.floor(Math.random() * 100000)}</div>
            <div>Nợ: 131</div>
            <div>Có: 5111</div>
            <div>Loại tiền: VND</div>
          </div>
        </div>

        {/* Table */}
        <table className="w-full border-collapse border border-black text-sm mb-4">
          <thead>
            <tr className="font-bold">
              <th className="border border-black p-2 text-center w-12">STT</th>
              <th className="border border-black p-2 text-center w-32">Mã hàng</th>
              <th className="border border-black p-2 text-center">Tên hàng</th>
              <th className="border border-black p-2 text-center w-20">Đơn vị</th>
              <th className="border border-black p-2 text-center w-20">Số lượng</th>
              <th className="border border-black p-2 text-center w-28">Đơn giá</th>
              <th className="border border-black p-2 text-center w-32">Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            {allItems.map((item, idx) => (
              <tr key={idx}>
                <td className="border border-black p-2 text-center">{idx + 1}</td>
                <td className="border border-black p-2">{item.catalogItem?.model || ""}</td>
                <td className="border border-black p-2">{item.name}</td>
                <td className="border border-black p-2 text-center">{item.catalogItem?.unit || "Cái"}</td>
                <td className="border border-black p-2 text-right">{formatVND(item.quantity)}</td>
                <td className="border border-black p-2 text-right">{formatVND(item.unitPrice)}</td>
                <td className="border border-black p-2 text-right">{formatVND(item.quantity * item.unitPrice)}</td>
              </tr>
            ))}
            
            {/* Table Totals */}
            <tr className="font-bold">
              <td className="border border-black p-2 text-center" colSpan={4}>Cộng</td>
              <td className="border border-black p-2 text-right">{formatVND(totalQuantity)}</td>
              <td className="border border-black p-2 text-center bg-gray-50"></td>
              <td className="border border-black p-2 text-right">{formatVND(totalAmount)}</td>
            </tr>
            <tr className="font-bold">
              <td className="border border-black p-2 text-center" colSpan={6}>Cộng tiền hàng</td>
              <td className="border border-black p-2 text-right">{formatVND(totalAmount)}</td>
            </tr>
            <tr className="font-bold">
              <td className="border border-black p-2" colSpan={4}>Thuế suất GTGT: <span className="float-right">{taxRate} %</span></td>
              <td className="border border-black p-2 text-center" colSpan={2}>Tiền thuế GTGT:</td>
              <td className="border border-black p-2 text-right">{formatVND(taxAmount)}</td>
            </tr>
            <tr className="font-bold">
              <td className="border border-black p-2 text-center" colSpan={6}>Tổng tiền thanh toán</td>
              <td className="border border-black p-2 text-right">{formatVND(grandTotal)}</td>
            </tr>
          </tbody>
        </table>

        {/* Footer */}
        <div className="font-bold italic mb-6">
          Số tiền bằng chữ: {numberToVietnameseWords(grandTotal)}
        </div>
        
        <div className="mb-20">
          <div>Chưa thanh toán (ký xác nhận KH):</div>
        </div>

      </div>
    </div>
  );
}
