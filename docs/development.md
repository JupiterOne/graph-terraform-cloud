# Development

This integration focuses on [Terraform Cloud](https://www.terraform.io/cloud)
and is using the
[Terraform Cloud API](https://www.terraform.io/cloud-docs/api-docs#terraform-cloud-api-documentation)
for interacting with the Terraform Cloud resources.

## Provider account setup

Reference:
[Terraform Cloud Get-Started Tutorial](https://learn.hashicorp.com/tutorials/terraform/cloud-sign-up?in=terraform/cloud-get-started)

1. [Sign-up](https://app.terraform.io/signup/account) for a Terraform cloud
   account.
2. Select start from scratch and create an organization.
3. Enter the neccesary details and then click 'Create organization'
4. If you need a workspace, create a workspace.

## Authentication

To start the integration, we need to provide an API Authentication token to our
integration.
[Generate organization token](https://www.terraform.io/cloud-docs/api-docs#authentication)
and provide it to your `.env`. Once that's done, you should now be able to start
contributing to this integration. The integration will pull in the `API_KEY` and
`ORGANIZATION_NAME` variables from the `.env` file and use them when making
requests.
