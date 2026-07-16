from pydantic import BaseModel, Field
from typing import Optional

class CustomerDTO(BaseModel):
    customer_id: str = Field(..., description="Unique customer identification number")
    name: str = Field(..., description="Full customer name")
    pan_number: str = Field(..., description="Permanent Account Number (BOM identifier)")
    tier: str = Field(..., description="Customer profile tier: RETAIL, HNI, corporate")
    risk_rating: str = Field("low", description="Internal risk classification: low, medium, high")

class AccountDTO(BaseModel):
    account_number: str = Field(..., description="Unique bank account number")
    customer_id: str = Field(..., description="Associated customer identification")
    account_type: str = Field(..., description="Account type: SAVINGS, CURRENT, OVERDRAFT")
    balance: float = Field(0.0, description="Current ledger balance")
    status: str = Field("ACTIVE", description="Account standing: ACTIVE, FROZEN, DORMANT")

class TransactionDTO(BaseModel):
    tx_id: str = Field(..., description="Unique transaction logging hash")
    account_number: str = Field(..., description="Originating account number")
    type: str = Field(..., description="Transaction type: DEBIT, CREDIT, TRANSFER")
    amount: float = Field(..., description="Transaction value in INR")
    remote_ip: str = Field(..., description="IP address of transaction host source")
    status: str = Field("PENDING", description="Transaction state: PENDING, AUTHORIZED, DENIED")

class SystemConfigDTO(BaseModel):
    parameter_key: str = Field(..., description="System parameter variable name")
    parameter_value: str = Field(..., description="Parameter value")
    last_modified_by: str = Field(..., description="Operator identifier who made edits")
    signature: str = Field(..., description="Cryptographic integrity tag signature")

class DatabaseConsoleDTO(BaseModel):
    command_type: str = Field(..., description="Database command type: SELECT, INSERT, UPDATE, DELETE, DDL")
    sql_statement: str = Field(..., description="Full raw SQL command input")
    affected_rows: int = Field(0, description="Count of affected rows in tables")
    execution_time: float = Field(0.0, description="Total statement run duration in ms")
    target_table: str = Field(..., description="Table name targeted by SQL operation")

class BackupCenterDTO(BaseModel):
    backup_id: str = Field(..., description="Unique backup hash ID")
    backup_type: str = Field(..., description="Backup configuration: incremental, full")
    destination_node: str = Field(..., description="Vault node IP address where backup was sent")
    status: str = Field("COMPLETED", description="Backup process status")
    signature: str = Field(..., description="Continuous audit chain verification signature")
