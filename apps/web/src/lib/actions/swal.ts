"use client";

import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

export const showDeleteConfirm = (count: number, entityName: string) => {
  return MySwal.fire({
    title: "Emin misiniz?",
    text: `${count} adet ${entityName} silinecek. Bu işlem geri alınamaz!`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Evet, sil!",
    cancelButtonText: "İptal",
    confirmButtonColor: "#dc3545", // Bootstrap danger color
    cancelButtonColor: "#6c757d", // Bootstrap secondary color
    customClass: {
      popup: "card border-0 shadow rounded-4 p-3",
      header: "card-header bg-transparent border-bottom-0",
      title: "h5 fw-bold",
      actions: "card-footer bg-transparent border-top-0 pt-0",
      confirmButton: "btn btn-danger",
      cancelButton: "btn btn-light ms-2",
    },
    buttonsStyling: false,
  });
};