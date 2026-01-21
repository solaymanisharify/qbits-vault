import CustomModal from "../global/modal/CustomModal";

const ForgetPasswordModel = ({ setShowConfirmModal, handleFirstConfirm, handleSecondConfirm }) => {
  return (
    <CustomModal>
      <form >
        <h3 className="text-lg font-bold text-gray-600 mb-8 text-center">Enter Your Email</h3>
        <div className="mb-8">
          <input type="email" placeholder="Email" className="w-full py-2 px-6 rounded border border-gray-200" />
        </div>

        {/* Buttons */}
        {/* <div className="flex gap-4 justify-end">
          <button
            // onClick={() => setShowConfirmModal(false)}
            className="px-6 py-2 text-red-400 border border-red-400/50 rounded-xl hover:bg-red-400/10 transition font-medium"
          >
            Cancel
          </button>
          <button
            // onClick={handleFirstConfirm}

            className="px-6 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Submit
          </button>
        </div> */}
      </form>
    </CustomModal>
  );
};

export default ForgetPasswordModel;
