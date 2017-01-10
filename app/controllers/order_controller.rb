#encoding: utf-8

class OrderController < ApplicationController
  protect_from_forgery with: :exception

  def index
    cart = get_user_cart
    redirect_to "/" if cart.is_empty?

    @scripts_id       = 'order-index'
    @css_class_layout = 'bm-layout-page-order m-fullwidth'

    bootstrap_order_data
  end

  def bootstrap_order_data
    order_data = File.read('config/order_data.json')
    order_data = JSON.parse(order_data)

    @bootstrapped_data ||= {}
    @bootstrapped_data[:order_data] = order_data
  end
end
