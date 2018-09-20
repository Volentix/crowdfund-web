<template>
  <div id="dashboard">
    <b-row>
      <b-col>
        <h3>Dashboard</h3>
      </b-col>
    </b-row>
    <b-row style="margin-top: 25px;">
      <b-col>
        <b-card-group deck class="mb-3" style="font-size: 18px;">
          <b-card
            header="Total VTX"
            text-variant="white" 
            bg-variant="secondary" 
            align="center">
            <p class="card-text">{{ stats.total_vtx | currency_format }}</p>
          </b-card>
        </b-card-group>
      </b-col>
    </b-row>
    <b-row style="margin-top: 25px;">
      <b-col>
        <b-table 
          style="color: white;" 
          striped small
          :per-page="perPage" 
          :current-page="currentPage" 
          :fields="fields" 
          :items="transactions">
          <template slot="show_details" scope="row" v-if="row.item.type === 'Deposit'">
            <b-button size="sm" @click.stop="row.toggleDetails" class="mr-2">
              {{ row.detailsShowing ? 'Hide' : 'Show'}} Details
            </b-button>
            <b-button size="sm" class="mr-2" 
              v-if="showRefundButton(row.item.refundable, row.item.refund_pending)" 
              @click="refund(row.item.id, row.item.amount, row.item.currency)">
              Refund
            </b-button>
          </template>
          <template slot="row-details" scope="row">
            <b-card bg-variant="secondary">
              <b-row class="mb-2">
                <b-col class="text-sm-center"><h4>Blockchain Records</h4></b-col>
              </b-row>
              <b-row class="mb-2">
                <b-col sm="3" class="text-sm-right"><b>Deposit</b></b-col>
                <b-col>
                  <p>Amount: {{ row.item.amount | currency_format }} {{ row.item.currency }}</p>
                  Record: <a style="color: lightgreen; font-size: 14px;" :href="row.item.transaction_details_link" target="_blank">
                    {{ row.item.transaction_hash }}
                  </a>
                </b-col>
              </b-row>
              <b-row class="mb-2">
                <b-col sm="3" class="text-sm-right"><b>Credit</b></b-col>
                <b-col>
                  <p>Amount: {{ row.item.credit_transaction.amount | currency_format }} VTX</p>
                  Record: <a style="color: lightgreen; font-size: 14px;" :href="row.item.transaction_details_link" target="_blank">
                    {{ row.item.transaction_hash }}
                  </a>
                </b-col>
              </b-row>
            </b-card>
          </template>
        </b-table>
        <b-pagination 
          v-if="transactions.length > perPage"  
          :total-rows="transactions.length" 
          :per-page="perPage" 
          v-model="currentPage" />
      </b-col>
    </b-row>
    <refund-modal ref="refund" :id="refundDepositId" :amount="refundAmount" :currency="refundCurrency"></refund-modal>
  </div>
</template>

<script>
import RefundModal from '@/components/modals/RefundModal'
import axios from 'axios'

export default {
  name: 'Dashboard',
  components: { RefundModal },
  data () {
    return {
      transactions: [],
      perPage: 6,
      currentPage: 1,
      fields: {
        number: {label: '#', sortable: true},
        id: {label: 'Transaction ID'},
        type: {label: 'Type'},
        amount: {
          label: 'Amount',
          formatter: this.$options.filters.currency_format,
          tdClass: 'right-cell'
        },
        currency: {label: 'Currency'},
        transaction_date: {label: 'Transaction Date'},
        vtx_credit: {
          label: 'VTX Credit',
          formatter: this.$options.filters.currency_format,
          tdClass: 'right-cell'
        },
        show_details: {label: 'Actions'}
      },
      stats: {},
      refundDepositId: null,
      refundAmount: 0,
      refundCurrency: ''
    }
  },
  methods: {
    getTransactions (vm) {
      axios.post('/get-transactions/', {api_token: vm.$store.state.apiToken}).then(response => {
        if (response.data.success) {
          vm.transactions = response.data.transactions
        }
      })
    },
    refund (depositId, amount, currency) {
      this.refundDepositId = depositId
      this.refundAmount = amount
      this.refundCurrency = currency
      this.$refs.refund.$refs.refundModal.show()
    },
    showRefundButton (refundable, refundPending) {
      if (refundable) {
        if (refundPending) {
          return false
        } else {
          return true
        }
      } else {
        return false
      }
    }
  },
  created () {
    const vm = this
    this.getTransactions(vm)
    axios.post('/get-user-stats/', {api_token: vm.$store.state.apiToken}).then(response => {
      if (response.data.success) {
        vm.stats = response.data.stats
      }
    })
  },
  mounted () {
    const vm = this
    this.$on('refresh-transactions-table', function () {
      this.getTransactions(vm)
    })
  }
}
</script>

<style>
#dashboard h3 {
  color: white;
}
li.active {
  background: lightgray;
  color: black;
}
td.right-cell {
  text-align: right;
}
</style>