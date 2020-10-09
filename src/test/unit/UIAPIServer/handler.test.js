'use strict';
const handlers = require('../../../UIAPIServer/handlers');
const { CertificatesModel } = require('@internal/model');


describe('create dfsp csr and upload to mcm', () => {
    test('when creating a csr it calls one time to certificates model csr creation and upload csr', async () => {

        const csrParameters = {
            privateKeyAlgorithm: 'rsa',
            privateKeyLength: 4096,
            parameters: 'mocked'
        };

        const encryptedKey = 'encryptedKey';

        const createdCsrMock = { mocked: true};
        
        const context =  {
            'state': {
                'conf': {
                    envId: '1',
                    dfspId: 'pm4mltest',
                    privateKeyAlgorithm: csrParameters.privateKeyAlgorithm,
                    privateKeyLength : csrParameters.privateKeyLength,
                    dfspCsrParameters: csrParameters.parameters,
                    dfspCsrEncryptedKey: encryptedKey
                },
            },
            params: { 'envId': '1' }
        };

        const createClientCSRSpy = jest.spyOn(CertificatesModel.prototype, 'createClientCSR')
            .mockImplementation(() => { return createdCsrMock; });

        const uploadClientCSRSpy = jest.spyOn(CertificatesModel.prototype, 'uploadClientCSR')
            .mockImplementation(() => {});


        await handlers['/environments/{envId}/dfsp/clientcerts/csr'].post(context);

        expect(createClientCSRSpy).toHaveBeenCalledTimes(1);
        expect(uploadClientCSRSpy).toHaveBeenCalledTimes(1);

        expect(createClientCSRSpy.mock.calls[0][0]).toStrictEqual(csrParameters);
        expect(createClientCSRSpy.mock.calls[0][1]).toStrictEqual(encryptedKey);

        expect(uploadClientCSRSpy.mock.calls[0][0]).toStrictEqual(createdCsrMock);
    });
});
