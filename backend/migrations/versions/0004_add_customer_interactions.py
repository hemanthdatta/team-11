"""
Add customer_interactions table

Revision ID: 0004_add_customer_interactions
Revises: 0003_add_profile_fields
Create Date: 2025-09-14
"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic
revision = '0004_add_customer_interactions'
down_revision = '0003_add_profile_fields'
branch_labels = None
depends_on = None

def upgrade():
    op.create_table(
        'customer_interactions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('customer_id', sa.Integer(), nullable=True),
        sa.Column('user_id', sa.Integer(), nullable=True),
        sa.Column('interaction_type', sa.String(), nullable=True),
        sa.Column('interaction_date', sa.DateTime(timezone=True), nullable=True),
        sa.Column('title', sa.String(), nullable=True),
        sa.Column('notes', sa.String(), nullable=True),
        sa.Column('follow_up_needed', sa.Boolean(), nullable=True, default=False),
        sa.Column('follow_up_date', sa.DateTime(timezone=True), nullable=True),
        sa.Column('status', sa.String(), nullable=True, default='completed'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True, onupdate=sa.text('now()')),
        sa.ForeignKeyConstraint(['customer_id'], ['customers.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_customer_interactions_interaction_type'), 'customer_interactions', ['interaction_type'], unique=False)
    op.create_index(op.f('ix_customer_interactions_interaction_date'), 'customer_interactions', ['interaction_date'], unique=False)

def downgrade():
    op.drop_index(op.f('ix_customer_interactions_interaction_date'), table_name='customer_interactions')
    op.drop_index(op.f('ix_customer_interactions_interaction_type'), table_name='customer_interactions')
    op.drop_table('customer_interactions')
