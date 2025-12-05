-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.cancellation_requests (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  order_id uuid NOT NULL,
  table_name text,
  reason text,
  requested_items jsonb,
  status text DEFAULT 'pending'::text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT cancellation_requests_pkey PRIMARY KEY (id),
  CONSTRAINT cancellation_requests_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id)
);
CREATE TABLE public.cart_items (
  id bigint NOT NULL DEFAULT nextval('cart_items_id_seq'::regclass),
  table_id bigint NOT NULL,
  menu_item_id uuid NOT NULL,
  quantity integer NOT NULL,
  unit_price numeric NOT NULL,
  total_price numeric NOT NULL,
  customizations jsonb,
  unique_id text UNIQUE,
  created_at timestamp with time zone DEFAULT now(),
  user_id uuid DEFAULT auth.uid(),
  CONSTRAINT cart_items_pkey PRIMARY KEY (id),
  CONSTRAINT cart_items_menu_item_id_fkey FOREIGN KEY (menu_item_id) REFERENCES public.menu_items(id),
  CONSTRAINT cart_items_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT cart_items_table_id_fkey FOREIGN KEY (table_id) REFERENCES public.tables(id)
);
CREATE TABLE public.categories (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL UNIQUE,
  CONSTRAINT categories_pkey PRIMARY KEY (id)
);
CREATE TABLE public.expenses (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  description text NOT NULL,
  amount numeric NOT NULL,
  expense_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamp with time zone DEFAULT now(),
  payment_method text DEFAULT 'cash'::text,
  category text,
  CONSTRAINT expenses_pkey PRIMARY KEY (id)
);
CREATE TABLE public.ingredients (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL UNIQUE,
  unit text NOT NULL,
  stock_quantity numeric NOT NULL DEFAULT 0,
  low_stock_threshold numeric DEFAULT 100,
  initial_stock numeric DEFAULT 100,
  last_reset_date date DEFAULT CURRENT_DATE,
  CONSTRAINT ingredients_pkey PRIMARY KEY (id)
);
CREATE TABLE public.menu_item_ingredients (
  menu_item_id uuid NOT NULL,
  ingredient_id uuid NOT NULL,
  quantity_required numeric NOT NULL,
  CONSTRAINT menu_item_ingredients_pkey PRIMARY KEY (menu_item_id, ingredient_id),
  CONSTRAINT menu_item_ingredients_menu_item_id_fkey FOREIGN KEY (menu_item_id) REFERENCES public.menu_items(id),
  CONSTRAINT menu_item_ingredients_ingredient_id_fkey FOREIGN KEY (ingredient_id) REFERENCES public.ingredients(id)
);
CREATE TABLE public.menu_item_options (
  menu_item_id uuid NOT NULL,
  option_group_id bigint NOT NULL,
  CONSTRAINT menu_item_options_pkey PRIMARY KEY (menu_item_id, option_group_id),
  CONSTRAINT menu_item_options_menu_item_id_fkey FOREIGN KEY (menu_item_id) REFERENCES public.menu_items(id),
  CONSTRAINT menu_item_options_option_group_id_fkey FOREIGN KEY (option_group_id) REFERENCES public.option_groups(id)
);
CREATE TABLE public.menu_items (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  price numeric NOT NULL,
  description text,
  image_url text,
  category_id uuid,
  is_available boolean DEFAULT true,
  is_hot boolean DEFAULT false,
  is_active boolean DEFAULT true,
  cost numeric DEFAULT 0,
  stock_quantity integer DEFAULT 0,
  low_stock_threshold integer DEFAULT 5,
  is_hidden boolean DEFAULT false,
  daily_stock_limit integer,
  remaining_quantity integer,
  CONSTRAINT menu_items_pkey PRIMARY KEY (id),
  CONSTRAINT menu_items_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id)
);
CREATE TABLE public.option_choices (
  id bigint NOT NULL DEFAULT nextval('option_choices_id_seq'::regclass),
  group_id bigint NOT NULL,
  name text NOT NULL,
  price_adjustment numeric NOT NULL DEFAULT 0,
  CONSTRAINT option_choices_pkey PRIMARY KEY (id),
  CONSTRAINT option_choices_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.option_groups(id)
);
CREATE TABLE public.option_groups (
  id bigint NOT NULL DEFAULT nextval('option_groups_id_seq'::regclass),
  name text NOT NULL UNIQUE,
  type text NOT NULL,
  CONSTRAINT option_groups_pkey PRIMARY KEY (id)
);
CREATE TABLE public.order_actions_log (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  action_type text NOT NULL,
  source_order_ids ARRAY,
  target_order_id bigint,
  moved_order_item_ids ARRAY,
  performed_by_user_id uuid,
  details jsonb,
  CONSTRAINT order_actions_log_pkey PRIMARY KEY (id),
  CONSTRAINT order_actions_log_performed_by_user_id_fkey FOREIGN KEY (performed_by_user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.order_item_out_of_stock_events (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  order_item_id bigint NOT NULL,
  menu_item_id uuid NOT NULL,
  order_id uuid NOT NULL,
  marked_out_of_stock_at timestamp with time zone NOT NULL DEFAULT now(),
  remarked_available_at timestamp with time zone,
  is_reordered_after_recovery boolean DEFAULT false,
  reordered_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT order_item_out_of_stock_events_pkey PRIMARY KEY (id)
);
CREATE TABLE public.order_items (
  id bigint NOT NULL DEFAULT nextval('order_items_id_seq'::regclass),
  order_id uuid NOT NULL,
  menu_item_id uuid,
  quantity integer NOT NULL,
  unit_price numeric NOT NULL,
  customizations jsonb,
  status text DEFAULT 'waiting'::text,
  returned_quantity integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT order_items_pkey PRIMARY KEY (id),
  CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id),
  CONSTRAINT order_items_menu_item_id_fkey FOREIGN KEY (menu_item_id) REFERENCES public.menu_items(id)
);
CREATE TABLE public.order_tables (
  order_id uuid NOT NULL,
  table_id bigint NOT NULL,
  CONSTRAINT order_tables_pkey PRIMARY KEY (order_id, table_id),
  CONSTRAINT order_tables_table_id_fkey FOREIGN KEY (table_id) REFERENCES public.tables(id),
  CONSTRAINT order_tables_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id)
);
CREATE TABLE public.orders (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  total_price numeric,
  status USER-DEFINED DEFAULT 'pending'::order_status_enum,
  is_provisional boolean DEFAULT false,
  payment_method text,
  created_at timestamp with time zone DEFAULT now(),
  user_id uuid DEFAULT auth.uid(),
  updated_at timestamp with time zone DEFAULT now(),
  table_name text,
  order_code text,
  paid_at timestamp with time zone,
  CONSTRAINT orders_pkey PRIMARY KEY (id),
  CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  email character varying UNIQUE,
  full_name text,
  role text NOT NULL DEFAULT 'nhan_vien'::text,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.purchase_order_items (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  purchase_order_id uuid NOT NULL,
  ingredient_id uuid NOT NULL,
  quantity numeric NOT NULL,
  CONSTRAINT purchase_order_items_pkey PRIMARY KEY (id),
  CONSTRAINT purchase_order_items_purchase_order_id_fkey FOREIGN KEY (purchase_order_id) REFERENCES public.purchase_orders(id),
  CONSTRAINT purchase_order_items_ingredient_id_fkey FOREIGN KEY (ingredient_id) REFERENCES public.ingredients(id)
);
CREATE TABLE public.purchase_orders (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  po_code text UNIQUE,
  status text NOT NULL DEFAULT 'pending'::text,
  created_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone,
  user_id uuid,
  notes text,
  CONSTRAINT purchase_orders_pkey PRIMARY KEY (id),
  CONSTRAINT purchase_orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.return_notifications (
  id bigint NOT NULL DEFAULT nextval('return_notifications_id_seq'::regclass),
  order_id uuid NOT NULL,
  table_name text,
  item_name text NOT NULL,
  status text DEFAULT 'pending'::text,
  acknowledged_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  notification_type text,
  CONSTRAINT return_notifications_pkey PRIMARY KEY (id),
  CONSTRAINT return_notifications_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id)
);
CREATE TABLE public.return_slip_items (
  id bigint NOT NULL DEFAULT nextval('return_slip_items_id_seq'::regclass),
  return_slip_id bigint NOT NULL,
  order_item_id bigint NOT NULL,
  quantity integer NOT NULL,
  unit_price numeric NOT NULL,
  CONSTRAINT return_slip_items_pkey PRIMARY KEY (id),
  CONSTRAINT return_slip_items_return_slip_id_fkey FOREIGN KEY (return_slip_id) REFERENCES public.return_slips(id),
  CONSTRAINT return_slip_items_order_item_id_fkey FOREIGN KEY (order_item_id) REFERENCES public.order_items(id)
);
CREATE TABLE public.return_slips (
  id bigint NOT NULL DEFAULT nextval('return_slips_id_seq'::regclass),
  order_id uuid NOT NULL,
  reason text,
  type text,
  created_at timestamp with time zone DEFAULT now(),
  status USER-DEFINED NOT NULL DEFAULT 'approved'::return_slip_status,
  CONSTRAINT return_slips_pkey PRIMARY KEY (id),
  CONSTRAINT return_slips_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id)
);
CREATE TABLE public.stock_history (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  ingredient_id uuid NOT NULL,
  quantity_change numeric NOT NULL,
  user_id uuid,
  notes text,
  CONSTRAINT stock_history_pkey PRIMARY KEY (id),
  CONSTRAINT stock_history_ingredient_id_fkey FOREIGN KEY (ingredient_id) REFERENCES public.ingredients(id),
  CONSTRAINT stock_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.tables (
  id bigint NOT NULL DEFAULT nextval('tables_id_seq'::regclass),
  name text NOT NULL UNIQUE,
  status text DEFAULT 'Trống'::text,
  seats integer,
  CONSTRAINT tables_pkey PRIMARY KEY (id)
);
CREATE TABLE public.transactions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  order_id uuid NOT NULL,
  amount numeric NOT NULL,
  payment_method USER-DEFINED NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT transactions_pkey PRIMARY KEY (id),
  CONSTRAINT transactions_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id)
);