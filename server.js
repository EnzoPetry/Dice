import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { initSocket } from "./src/lib/socket.js";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
	const server = createServer((req, res) => {
		const parsedUrl = parse(req.url, true);
		handle(req, res, parsedUrl);
	});

	initSocket(server);

	server.listen(3000, (err) => {
		if (err) throw err;
		console.log("> Servidor rodando em http://localhost:3000");
	});
});