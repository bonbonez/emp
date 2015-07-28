#encoding: utf-8

class CatalogueController < ApplicationController
  protect_from_forgery with: :exception

  def index
    @css_class_layout = 'bm-layout-page-catalogue m-fullwidth'
    @scripts_id       = 'catalogue-index'

    @items = Item.all
    @items_groups_for_featured = [
      {
        header: "Популярное",
        items: Item.last(4)
      },
      {
        header: "Любителям экспериментов",
        items: Item.last(3)
      },
      {
        header: "Лучшее из арома",
        items: Item.last(3)
      },
      {
        header: "Декаф (кофе без кофеина)",
        items: Item.last(2)
      }
    ]

    render 'index_2'#, layout: 'empty'
  end
end
