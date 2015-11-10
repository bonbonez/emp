class ApplicationController < ActionController::Base
  include CartHelper
  include ApplicationHelper

  before_filter :load_cart, :set_frontend_config
  after_filter :set_frontend_config
  protect_from_forgery with: :exception

  def load_cart
    cart_id = get_cart_id_from_cookie

    if cart_id.present?
      cart = Cart.find_by_cookie_id(cart_id)
      @cart = cart ? cart : Cart.create
    else
      @cart = Cart.create
    end

    save_cart_id_to_cookie(@cart.cookie_id)
  end

  def set_frontend_config
    @frontend_config = get_frontend_config
  end
end
