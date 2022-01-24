import fetch from 'isomorphic-unfetch';

import { createServer } from '../src';

describe('#createServer', () => {
	it('uses the handler to answer the request', async () => {
		const handler = jest.fn((_, res) => res.end());
		const { url, stopServer } = await createServer({ handler });

		await fetch(url);

		expect(handler).toHaveBeenCalled();
		await stopServer();
	});

	it('stops the server when the "stopServer" method is called', async () => {
		const handler = jest.fn((_, res) => res.end());
		const { url, stopServer } = await createServer({ handler });

		await stopServer();

		await expect(fetch(url)).rejects.toThrow(
			expect.objectContaining({
				name: 'FetchError',
				message: expect.stringContaining('ECONNREFUSED'),
			}),
		);
	});

	it('sends undefined as query in the request if no query is passed', async () => {
		const handler = jest.fn((_, res) => res.end());
		const { url, stopServer } = await createServer({ handler });

		await fetch(url);

		expect(handler).toHaveBeenCalledWith(
			expect.objectContaining({ query: undefined }),
			expect.anything(),
		);
		await stopServer();
	});

	it('sends the given object as query in the request', async () => {
		const handler = jest.fn((_, res) => res.end());
		const query = { foo: 'bar' };
		const { url, stopServer } = await createServer({ handler, query });

		await fetch(url);

		expect(handler).toHaveBeenCalledWith(expect.objectContaining({ query }), expect.anything());
		await stopServer();
	});

	it('sends query that the user updates using the "updateQuery" method', async () => {
		const handler = jest.fn((_, res) => res.end());
		const query = { foo: 'bar' };
		const { url, stopServer, updateQuery } = await createServer({ handler, query });

		await fetch(url);
		expect(handler).toHaveBeenCalledWith(expect.objectContaining({ query }), expect.anything());

		const newQuery = { foo: 'baz' };
		updateQuery(newQuery);
		await fetch(url);
		expect(handler).toHaveBeenCalledWith(
			expect.objectContaining({ query: newQuery }),
			expect.anything(),
		);

		await stopServer();
	});
});
