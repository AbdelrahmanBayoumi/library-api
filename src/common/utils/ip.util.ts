import { Request } from 'express';

export function extractIP(req: Request): string {
	let ip = '';
	if (req.headers && req.headers['x-forwarded-for']) {
		const forwardedFor = Array.isArray(req.headers['x-forwarded-for'])
			? req.headers['x-forwarded-for'][0]
			: req.headers['x-forwarded-for'].toString().split(',')[0];
		ip = forwardedFor;
	} else {
		ip = req.ips?.length ? req.ips?.[0] : req.ip;
	}

	return ip;
}
