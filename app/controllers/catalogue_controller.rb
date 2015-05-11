class CatalogueController < ApplicationController
  protect_from_forgery with: :exception

  def index
    @css_class_layout = 'bm-layout-page-catalogue'
    @scripts_id       = 'catalogue-index'

    @items_for_popular = Item.last(8)

    render 'index_2', layout: 'empty'
  end
end
