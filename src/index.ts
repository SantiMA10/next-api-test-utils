import http from 'http';
import { apiResolver } from 'next/dist/server/api-utils';
import testListen from 'test-listen';

interface Options {
	handler: unknown;
	query?: unknown;
}

export interface Server {
	url: string;
	stopServer: () => Promise<void>;
	updateQuery: (newQuery: unknown) => void;
}

export const createServer = async (options: Options): Promise<Server> => {
	let query = options.query;

	const server = http.createServer((req, res) =>
		apiResolver(
			req,
			res,
			query,
			options.handler,
			{
				previewModeId: 'id',
				previewModeEncryptionKey: 'key',
				previewModeSigningKey: 'key',
			},
			false,
		),
	);

	return {
		url: await testListen(server),
		stopServer: async () => {
			await new Promise((resolve) => server.close(resolve));
		},
		updateQuery: (newQuery) => {
			query = newQuery;
		},
	};
};
