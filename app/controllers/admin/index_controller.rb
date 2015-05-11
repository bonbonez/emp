class Admin::IndexController < Admin::AdminController

  def index
    render 'admin/index'
  end

  def enable_admin_access
    cookies[:f8e59798db35a1c8451b77a3c07994f2d243aba3] = { value: true, expires: 24.hour.from_now }
    redirect_to "/admin"
  end

  def disable_admin_access
    if cookies[:f8e59798db35a1c8451b77a3c07994f2d243aba3].present?
      cookies.delete :let_me_in_please_im_a_cat
    end
    redirect_to "/"
  end

end