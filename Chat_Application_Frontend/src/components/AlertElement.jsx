import { CircleCheckBig, InfoIcon, SquareCheck } from "lucide-react";
import { motion } from "framer-motion";

function AlertElement({ status, setStatus }) {
  if (!status.code) return null;

  if (status.code === 500 || status.code === 400) {
    setTimeout(() => setStatus({ code: null, msg: null }), 2000);

    return (
      <div className="fixed inset-0 flex items-center justify-center z-70">
        <motion.div
          role="alert"
          className="alert alert-error absolute top-5 left-1/2 border-0 transform -translate-x-1/2 flex items-center justify-center bg-red-500 text-white p-4 rounded-lg shadow-lg w-[60%] md:w-[40%] lg:w-[30%]"
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 10 }}
        >
          <InfoIcon className="w-6 h-6" />
          <span className="text-sm sm:text-base">{status.msg}</span>
        </motion.div>
      </div>
    );
  }

  if (status.code === 200 || status.code === 201) {
    setTimeout(() => setStatus({ code: null, msg: null }), 2000);

    return (
      <div className="fixed inset-0 flex items-center justify-center z-70">
        <motion.div
          role="alert"
          className="alert alert-success absolute top-5 left-1/2 border-0 transform -translate-x-1/2 flex items-center justify-center bg-green-600 text-white p-4 rounded-lg shadow-lg w-[70%] md:w-[40%] lg:w-[30%]"
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 10 }}
        >
          <CircleCheckBig className="w-6 h-6" />
          <span className="text-sm sm:text-base">{status.msg}</span>
        </motion.div>
      </div>
    );
  }
}

export default AlertElement;
