class Admin::AdminController < ActionController::Base
  #before_filter :check_access, except: [:enable_admin_access, :disable_admin_access]

  layout 'admin'

  private

  def check_access
    unless cookies["f8e59798db35a1c8451b77a3c07994f2d243aba3"].present?
      raise ActiveRecord::RecordNotFound
    end
  end
end
