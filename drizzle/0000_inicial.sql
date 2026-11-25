CREATE TABLE "actividad" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"usuario_id" text,
	"usuario_nombre" text,
	"accion" text NOT NULL,
	"entidad" text NOT NULL,
	"entidad_id" text,
	"detalle" jsonb,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "consultas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"publicacion_id" uuid,
	"rubro" text DEFAULT 'vehiculo' NOT NULL,
	"tipo" text DEFAULT 'consulta' NOT NULL,
	"nombre" text NOT NULL,
	"telefono" text NOT NULL,
	"email" text,
	"mensaje" text NOT NULL,
	"estado" text DEFAULT 'nueva' NOT NULL,
	"ip_hash" text,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL,
	"actualizado_en" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "mensaje_largo" CHECK (char_length("consultas"."mensaje") <= 2000),
	CONSTRAINT "consulta_estado_valido" CHECK ("consultas"."estado" IN ('nueva','respondida','cerrada')),
	CONSTRAINT "consulta_tipo_valido" CHECK ("consultas"."tipo" IN ('consulta','tasacion','contacto'))
);
--> statement-breakpoint
CREATE TABLE "cuentas" (
	"id" text PRIMARY KEY NOT NULL,
	"cuenta_id" text NOT NULL,
	"proveedor_id" text NOT NULL,
	"usuario_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expira_en" timestamp with time zone,
	"refresh_token_expira_en" timestamp with time zone,
	"scope" text,
	"password" text,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL,
	"actualizado_en" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fotos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"publicacion_id" uuid NOT NULL,
	"clave" text NOT NULL,
	"clave_miniatura" text NOT NULL,
	"ancho" integer NOT NULL,
	"alto" integer NOT NULL,
	"blur" text NOT NULL,
	"alt" text DEFAULT '' NOT NULL,
	"orden" integer NOT NULL,
	"subida_por" text,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "alt_largo" CHECK (char_length("fotos"."alt") <= 150)
);
--> statement-breakpoint
CREATE TABLE "limites" (
	"clave" text PRIMARY KEY NOT NULL,
	"cantidad" integer DEFAULT 0 NOT NULL,
	"ventana_hasta" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "limites_auth" (
	"id" text PRIMARY KEY NOT NULL,
	"clave" text NOT NULL,
	"cantidad" integer NOT NULL,
	"ultimo_pedido" bigint NOT NULL,
	CONSTRAINT "limites_auth_clave_unique" UNIQUE("clave")
);
--> statement-breakpoint
CREATE TABLE "publicaciones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"numero" serial NOT NULL,
	"rubro" text NOT NULL,
	"slug" text NOT NULL,
	"titulo" text NOT NULL,
	"descripcion" text DEFAULT '' NOT NULL,
	"operacion" text,
	"tipo" text NOT NULL,
	"precio" bigint,
	"moneda" text DEFAULT 'ARS' NOT NULL,
	"expensas" bigint,
	"estado" text DEFAULT 'borrador' NOT NULL,
	"destacada" boolean DEFAULT false NOT NULL,
	"atributos" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"zona" text,
	"direccion" text,
	"lat" numeric(9, 6),
	"lng" numeric(9, 6),
	"creado_por" text,
	"publicado_en" timestamp with time zone,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL,
	"actualizado_en" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "publicaciones_numero_unique" UNIQUE("numero"),
	CONSTRAINT "publicaciones_slug_unique" UNIQUE("slug"),
	CONSTRAINT "precio_no_negativo" CHECK ("publicaciones"."precio" IS NULL OR "publicaciones"."precio" >= 0),
	CONSTRAINT "titulo_largo" CHECK (char_length("publicaciones"."titulo") BETWEEN 3 AND 120),
	CONSTRAINT "descripcion_largo" CHECK (char_length("publicaciones"."descripcion") <= 5000),
	CONSTRAINT "estado_valido" CHECK ("publicaciones"."estado" IN ('borrador','publicada','reservada','cerrada')),
	CONSTRAINT "moneda_valida" CHECK ("publicaciones"."moneda" IN ('ARS','USD'))
);
--> statement-breakpoint
CREATE TABLE "sesiones" (
	"id" text PRIMARY KEY NOT NULL,
	"expira_en" timestamp with time zone NOT NULL,
	"token" text NOT NULL,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL,
	"actualizado_en" timestamp with time zone DEFAULT now() NOT NULL,
	"ip" text,
	"user_agent" text,
	"usuario_id" text NOT NULL,
	CONSTRAINT "sesiones_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "usuarios" (
	"id" text PRIMARY KEY NOT NULL,
	"nombre" text NOT NULL,
	"email" text NOT NULL,
	"email_verificado" boolean DEFAULT false NOT NULL,
	"imagen" text,
	"rol" text DEFAULT 'editor' NOT NULL,
	"activo" boolean DEFAULT true NOT NULL,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL,
	"actualizado_en" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "usuarios_email_unique" UNIQUE("email"),
	CONSTRAINT "rol_valido" CHECK ("usuarios"."rol" IN ('dueno','editor','demo'))
);
--> statement-breakpoint
CREATE TABLE "verificaciones" (
	"id" text PRIMARY KEY NOT NULL,
	"identificador" text NOT NULL,
	"valor" text NOT NULL,
	"expira_en" timestamp with time zone NOT NULL,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL,
	"actualizado_en" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "actividad" ADD CONSTRAINT "actividad_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consultas" ADD CONSTRAINT "consultas_publicacion_id_publicaciones_id_fk" FOREIGN KEY ("publicacion_id") REFERENCES "public"."publicaciones"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cuentas" ADD CONSTRAINT "cuentas_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fotos" ADD CONSTRAINT "fotos_publicacion_id_publicaciones_id_fk" FOREIGN KEY ("publicacion_id") REFERENCES "public"."publicaciones"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fotos" ADD CONSTRAINT "fotos_subida_por_usuarios_id_fk" FOREIGN KEY ("subida_por") REFERENCES "public"."usuarios"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "publicaciones" ADD CONSTRAINT "publicaciones_creado_por_usuarios_id_fk" FOREIGN KEY ("creado_por") REFERENCES "public"."usuarios"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sesiones" ADD CONSTRAINT "sesiones_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "actividad_fecha_idx" ON "actividad" USING btree ("creado_en");--> statement-breakpoint
CREATE INDEX "consultas_estado_idx" ON "consultas" USING btree ("rubro","estado","creado_en");--> statement-breakpoint
CREATE UNIQUE INDEX "fotos_orden_unico" ON "fotos" USING btree ("publicacion_id","orden");--> statement-breakpoint
CREATE INDEX "publicaciones_listado_idx" ON "publicaciones" USING btree ("rubro","estado","precio");--> statement-breakpoint
CREATE INDEX "publicaciones_zona_idx" ON "publicaciones" USING btree ("zona");--> statement-breakpoint
CREATE INDEX "publicaciones_atributos_idx" ON "publicaciones" USING gin ("atributos");