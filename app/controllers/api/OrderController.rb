class Api::OrderController < Api::ApiController

  def get_available_delivery_methods
    cart = get_user_cart

  end

  def get_available_payment_methods
    cart = get_user_cart
  end

end