use actix_web::{web, App, HttpResponse, HttpServer, Responder};

async fn index() -> impl Responder {
    HttpResponse::Ok().body("Hello NEAR!!!")
}

async fn validate(quest_id: web::Path<String>) -> impl Responder {
    HttpResponse::Ok().body(format!("Validating quest with id: {}", quest_id))
}

async fn generate_claim_receipt(info: web::Path<(String, String)>) -> impl Responder {
    // info.0, info.1
    HttpResponse::Ok().body(format!(
        "Generating claim receipt for quest id and account id",
    ))
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        App::new()
            .route("/", web::get().to(index))
            .route("/v1/validate/{quest_id}", web::get().to(validate))
            .route(
                "/v1/generate-claim-receipt/{quest_id}/{account_id}",
                web::get().to(generate_claim_receipt),
            )
    })
    .bind("127.0.0.1:8080")?
    .run()
    .await
}
