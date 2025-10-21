import { Card, CardTitle, CardHeader } from '@/components/ui/card'
import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { capturePayment } from '@/api';

const PaymentReturn = () => {
  const location = useLocation()
  const params = new URLSearchParams(location.search);
  const paymentId = params.get('paymentId');
  const payerId = params.get('PayerID');

  useEffect(() => {
    async function capture() {
      const orderId = JSON.parse(sessionStorage.getItem("currentorderId") || "null");

      if (!paymentId || !payerId || !orderId) {
        console.error("Missing payment info.");
        return;
      }

      const payload = {
        paymentId,
        payerId,
        orderId,
      };

      try {
        const response = await capturePayment(payload);
        console.log(response);

        if (response?.data?.success) {
          sessionStorage.removeItem("currentorderId");
          window.location.href = '/student-courses';
        }
      } catch (err) {
        console.error("Error capturing payment:", err);
      }
    }

    capture();
  }, [payerId, paymentId]);



  return (
    <Card>
      <CardHeader>
        <CardTitle>Processing Payment.... please wait</CardTitle>
      </CardHeader>
    </Card>
  )
}

export default PaymentReturn