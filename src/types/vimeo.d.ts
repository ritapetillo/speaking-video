declare module "@vimeo/vimeo" {
  export class Vimeo {
    constructor(clientId: string, clientSecret: string, accessToken: string)
    upload(
      path: string,
      params: {
        name: string
        description?: string
        privacy?: { view: string }
        folder_uri?: string
      },
      completeCallback: (uri: string) => void,
      progressCallback?: (bytesUploaded: number, bytesTotal: number) => void,
      errorCallback?: (error: any) => void
    ): void
    request(
      path: string,
      callback: (
        error: any,
        body: any,
        statusCode?: number,
        headers?: any
      ) => void
    ): void
  }
}
