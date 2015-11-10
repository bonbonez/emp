Empressa::Application.routes.draw do

  namespace :admin do
    root to: 'index#index'
    get 'letmeinpleaseimacat', to: 'index#enable_admin_access'
    get 'letmeinpleaseimadog', to: 'index#disable_admin_access'

    resources :countries
    resources :items
  end

  namespace :api, path: 'api' do
    get 'translations/get', to: 'translations#get'

    get 'brewing_methods', to: 'misc#get_brewing_methods'
    get 'grind_types', to: 'misc#get_grind_types'

    get  'cart/get',         to: 'cart#get_cart'
    post 'cart/add_item',    to: 'cart#add_item'
    post 'cart/delete_item', to: 'cart#delete_item'
    post 'cart/remove_item', to: 'cart#remove_item'
  end

  #get "/" => "index#index"
  get "/" => "catalogue#index"
  get "/order" => "order#index"
  #get "/catalogue" => "catalogue#index"
end
