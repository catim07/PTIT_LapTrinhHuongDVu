import React, { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../store';
import { loadAddresses, addAddressThunk, updateAddressThunk, removeAddressThunk, setDefaultAddressThunk } from '../slices/addressSlice';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from '../components/Toast/toastEvent';

const addressSchema = z.object({
  name: z.string().min(2, 'Vui lòng nhập tên người nhận'),
  phone: z.string().regex(/^(0|\+84)[3|5|7|8|9][0-9]{8}$/, 'Số điện thoại không hợp lệ'),
  city: z.string().min(1, 'Vui lòng nhập tinh/thành phố'),
  district: z.string().min(1, 'Vui lòng nhập quận/huyện'),
  ward: z.string().min(1, 'Vui lòng nhập phường/xã'),
  street: z.string().min(1, 'Vui lòng nhập số nhà, tên đường'),
  is_default: z.boolean().optional()
});
type AddressFormData = z.infer<typeof addressSchema>;

const Addresses: React.FC = () => {
    const dispatch = useAppDispatch();
    const { data: addresses, status } = useAppSelector(state => state.address);
    const { user } = useAppSelector(state => state.auth);
  const currentUserId = user?.id ? Number(user.id) : null;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState<any>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<AddressFormData>({
      resolver: zodResolver(addressSchema),
      defaultValues: {
        is_default: false
      }
    });

    useEffect(() => {
      if (status === 'idle' && currentUserId) {
        dispatch(loadAddresses());
      }
    }, [status, currentUserId, dispatch]);

    const handleOpenModal = (address?: any) => {
      if (address) {
        setEditingAddress(address);
        setValue('name', address.name);
        setValue('phone', address.phone);
        setValue('city', address.city);
        setValue('district', address.district);
        setValue('ward', address.ward);
        setValue('street', address.street);
        setValue('is_default', address.is_default);
      } else {
        setEditingAddress(null);
        reset({ is_default: false });
      }
      setIsModalOpen(true);
    };

    const handleCloseModal = () => {
      setIsModalOpen(false);
      setEditingAddress(null);
      reset();
    };

    const onSubmit = async (data: AddressFormData) => {
      setIsSubmitting(true);
      try {
        if (editingAddress) {
          await dispatch(updateAddressThunk({ id: editingAddress.id, payload: data })).unwrap();
          toast.success('Cập nhật địa chỉ thành công');
        } else {
          await dispatch(addAddressThunk(data)).unwrap();
          toast.success('Thêm địa chỉ thành công');
        }
        handleCloseModal();
      } catch (err: any) {
        toast.error(err.message || 'Có lỗi xảy ra');
      } finally {
        setIsSubmitting(false);
      }
    };

    const handleDelete = async (id: string | number) => {
      setIsSubmitting(true);
      try {
        await dispatch(removeAddressThunk(String(id))).unwrap();
        toast.success('Đã xóa địa chỉ');
        setDeleteConfirm(null);
      } catch (err: any) {
        toast.error('Lỗi: ' + err.message);
      } finally {
        setIsSubmitting(false);
      }
    };

    const handleSetDefault = async (address: any) => {
      try {
        await dispatch(setDefaultAddressThunk(String(address.id))).unwrap();
        toast.success('Đã thiết lập làm mặc định');
      } catch (err: any) {
        toast.error('Lỗi: ' + err.message);
      }
    };

    return (
        <div className="font-sans">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Sổ địa chỉ</h1>
                <button onClick={() => handleOpenModal()} className="bg-primary text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-primary/90 transition shadow-sm border border-primary/20">
                   <span className="material-symbols-outlined text-sm">add</span> Thêm địa chỉ mới
                </button>
            </div>
            
            {status === 'loading' && <div className="text-center p-10 font-bold">Đang tải...</div>}
            
            {!addresses || addresses.length === 0 && status !== 'loading' ? (
              <div className="text-center p-10 mt-10 text-slate-500 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center">
                <span className="material-symbols-outlined text-5xl opacity-50 mb-3">location_off</span>
                <h3 className="text-xl font-bold text-slate-700 mb-1">Chưa có địa chỉ nào</h3>
                <p className="text-sm">Vui lòng thêm địa chỉ để thuận tiện hơn trong việc mua sắm.</p>
              </div>
            ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {addresses.map((addr) => (
                    <div key={addr.id} className="bg-white p-6 border border-slate-100 shadow-sm rounded-2xl relative flex flex-col justify-between">
                        <div>
                           {addr.is_default && <span className="absolute top-6 right-6 text-[10px] font-extrabold uppercase tracking-wide text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">Mặc định</span>}
                           <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
                             {addr.name} 
                             <span className="text-sm font-normal text-slate-500 block">| {addr.phone}</span>
                           </h3>
                           <p className="text-slate-600 text-sm leading-relaxed mb-4">
                             {addr.street}<br/>
                             {addr.ward}, {addr.district}, {addr.city}
                           </p>
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                            <div className="flex gap-4">
                               <button onClick={() => handleOpenModal(addr)} className="text-blue-600 font-bold text-sm hover:underline cursor-pointer flex items-center gap-1">
                                 <span className="material-symbols-outlined text-sm">edit</span> Sửa
                               </button>
                               <button onClick={() => setDeleteConfirm(String(addr.id))} className="text-red-500 font-bold text-sm hover:underline cursor-pointer flex items-center gap-1">
                                 <span className="material-symbols-outlined text-sm">delete</span> Xóa
                               </button>
                            </div>
                            {!addr.is_default && (
                                <button onClick={() => handleSetDefault(addr)} className="text-xs font-bold px-3 py-1.5 border border-slate-200 text-slate-600 hover:border-primary hover:text-primary transition rounded-lg">
                                    Thiết lập mặc định
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            )}

            {/* Address Form Modal */}
            {isModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm shadow-2xl overflow-y-auto">
                <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden my-8">
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                       <span className="material-symbols-outlined text-primary">location_on</span>
                       {editingAddress ? 'Cập nhật địa chỉ' : 'Thêm địa chỉ mới'}
                    </h2>
                    <button onClick={handleCloseModal} className="w-8 h-8 flex justify-center items-center rounded-full hover:bg-slate-200 transition">
                      <span className="material-symbols-outlined text-sm font-bold">close</span>
                    </button>
                  </div>
                  
                  <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                       <div>
                         <label className="block text-sm font-bold text-slate-700 mb-1">Tên người nhận</label>
                         <input {...register('name')} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition" placeholder="Họ và tên..." />
                         {errors.name && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.name.message as string}</p>}
                       </div>
                       <div>
                         <label className="block text-sm font-bold text-slate-700 mb-1">Số điện thoại</label>
                         <input {...register('phone')} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition" placeholder="09xxxxxxxxx" />
                         {errors.phone && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.phone.message as string}</p>}
                       </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                       <div>
                         <label className="block text-sm font-bold text-slate-700 mb-1">Tỉnh/TP</label>
                         <input {...register('city')} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition" placeholder="VD: Hồ Chí Minh" />
                         {errors.city && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.city.message as string}</p>}
                       </div>
                       <div>
                         <label className="block text-sm font-bold text-slate-700 mb-1">Quận/Huyện</label>
                         <input {...register('district')} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition" placeholder="VD: Quận 1" />
                         {errors.district && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.district.message as string}</p>}
                       </div>
                       <div>
                         <label className="block text-sm font-bold text-slate-700 mb-1">Phường/Xã</label>
                         <input {...register('ward')} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition" placeholder="VD: Đa Kao" />
                         {errors.ward && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.ward.message as string}</p>}
                       </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">Địa chỉ cụ thể (Số nhà, đường)</label>
                      <input {...register('street')} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition" placeholder="Ví dụ: 77 Lê Thánh Tôn" />
                      {errors.street && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.street.message as string}</p>}
                    </div>

                    {!editingAddress?.is_default && (
                      <div className="flex items-center gap-2 mt-4">
                        <input type="checkbox" id="is_default" {...register('is_default')} className="w-4 h-4 text-primary bg-slate-100 border-slate-300 rounded focus:ring-primary focus:ring-2" />
                        <label htmlFor="is_default" className="text-sm font-medium text-slate-700 cursor-pointer">
                          Đặt làm địa chỉ mặc định
                        </label>
                      </div>
                    )}

                    <div className="pt-6 flex gap-3">
                      <button type="button" onClick={handleCloseModal} className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition">Hủy</button>
                      <button type="submit" className="flex-1 px-4 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition shadow-md shadow-primary/20">Lưu địa chỉ</button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Delete Confirm Modal */}
            {deleteConfirm && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl">
                    <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4 mx-auto">
                        <span className="material-symbols-outlined text-2xl">warning</span>
                    </div>
                    <h3 className="text-xl font-bold text-center mb-2">Xác nhận xóa địa chỉ</h3>
                    <p className="text-center text-slate-500 mb-6 text-sm">Bạn có chắc chắn muốn xóa địa chỉ này? Hành động không thể hoàn tác.</p>
                    <div className="flex gap-3">
                        <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition">Đóng</button>
                        <button onClick={() => handleDelete(deleteConfirm)} disabled={isSubmitting} className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition disabled:opacity-50">
                            {isSubmitting ? 'Đang xử lý...' : 'Xác nhận xóa'}
                        </button>
                    </div>
                </div>
              </div>
            )}
        </div>
    );
};
export default Addresses;
