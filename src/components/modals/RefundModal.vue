<template>
  <!-- Refund Modal -->
  <b-modal id="refund-modal" :title="$t('refund_form')" ref="refundModal" centered hide-footer>
    <b-form @submit="applyRefund($event)">
      <p>Amount</p>
      <h4>{{ amount | currency_format }} {{ currency }}</h4><br>
      <b-form-group label="Destination Address" :description="'Make sure it is a valid ' + currency + ' address'">
        <b-form-input v-model.trim="destinationAddress" placeholder="Enter destination address"></b-form-input>
      </b-form-group>
      <b-form-group>
        <b-button v-show="!formSubmitted" type="submit" variant="primary" :disabled="disableLoginSubmit">{{ $t('submit') }}</b-button>
        <img v-show="formSubmitted" src="../../assets/animated_spinner.gif" height="50">
      </b-form-group>
    </b-form>
  </b-modal>
</template>

<script>
import axios from 'axios'

export default {
  name: 'RefundModal',
  props: ['id', 'amount', 'currency'],
  data () {
    return {
      destinationAddress: '',
      formSubmitted: false
    }
  },
  computed: {
    disableLoginSubmit () {
      return this.destinationAddress.length === 0
    }
  },
  methods: {
    applyRefund (event) {
      event.preventDefault()
      this.formSubmitted = true
      let payload = {
        id: this.id,
        api_token: this.$store.state.apiToken,
        destination_address: this.destinationAddress
      }
      axios.post('/apply-refund/', payload).then(response => {
        this.$refs.refundModal.hide()
        this.$parent.$emit('refresh-transactions-table')
      })
    }
  }
}
</script>
