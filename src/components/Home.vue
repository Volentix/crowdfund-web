<template>
  <div id="home">
    <div>
      <b-row id="home-top">
        <b-col sm="4" class="text-center">
          <b-row>
            <b-col>
              <img src="../assets/logo_white.png" height="180">
            </b-col>
          </b-row>
          <b-row style="margin-top: 15px;">
            <b-col>
              <b-btn style="padding: 10px 46px; border: 1px solid #fff !important; border-radius: 0 !important;"
                variant="primary" 
                @click="contributeNow()"
                :disabled="disableContributeButton">
                CONTRIBUTE
              </b-btn>
            </b-col>
          </b-row>
          <b-row style="margin-top: 10px; font-size: 15px;">
            <b-col>
              <p>CURRENT PRICE {{ currentVTXPrice }} BTC</p>
            </b-col>
          </b-row>
        </b-col>
        <b-col>
          <b-row>
            <b-col>
              <p style="text-align: center; font-size: 28px;">
                VTX TOKEN DISTRIBUTION
              </p>
            </b-col>
          </b-row>
          <b-row style="margin-top: 12px;">
            <b-col>
              <p>
                TOTAL CLAIMED
              </p>
              <p>
                <b-progress 
                  :value="percentReserved" 
                  :label="reservedVTX" 
                  variant="secondary" 
                  height="24px" 
                  class="mb-3" 
                  style="background: #2e3847; border: 1px solid #f4f4f4; border-radius: 0px;">
                </b-progress>
                <span>0 VTX</span>
                <span style="float: right;">{{ totalVTX | currency_format }} VTX</span>
              </p>
            </b-col>
          </b-row>
          <b-row style="margin-top: 20px;">
            <b-col>
              <b-row>
                <b-col>
                  <div>CURRENT ROUND</div>
                  <div style="display: inline-block;">
                    <p style="font-size: 45px; margin-bottom: 0;">{{ remainingVTX }}</p>
                    <p style="font-size: 13px; text-align: right; margin-top: -2px;">AVAILABLE</p>
                  </div>
                </b-col>
                <b-col>
                  <div>CURRENT VTX PRICE</div>
                  <b-row align-v="center">
                    <b-col>
                      <div style="display: inline-block;">
                        <p style="font-size: 45px; margin-bottom: 0;">{{ selectedCurrencyRate | currency_format }}</p>
                        <p style="font-size: 13px; text-align: right; margin-top: -2px;">VTX</p>
                      </div>
                    </b-col>
                    <b-col sm="2">
                      per
                    </b-col>
                    <b-col style="padding-left: 0px;">
                      <b-form-select 
                        style="width: 100%;" 
                        v-model="selectedCurrency"  
                        :options="currencyOptions">
                      </b-form-select>
                    </b-col>
                  </b-row>
                </b-col>
              </b-row>
              <b-row style="margin-top: 15px;">
                <b-col>
                  <div>CURRENT ROUND ENDS IN</div>
                  <p style="font-size: 30px; margin-bottom: 0;">
                    <countdown :initial="roundEnd" :totalseconds="roundEndSeconds" showdays="1"></countdown>
                  </p>
                </b-col>
                <b-col>
                  <div>NEXT PRICE INCREASE</div>
                  <p style="font-size: 30px; margin-bottom: 0;">
                    <countdown :initial="nextIncrease" :totalseconds="nextIncreaseSeconds" showdays="0"></countdown>
                  </p>
                </b-col>
              </b-row>
            </b-col>
          </b-row>
        </b-col>
      </b-row>
      <b-row id="home-bottom">
        <b-col></b-col>
      </b-row>
      <sign-up-modal ref="signUp"></sign-up-modal>
    </div>
  </div>
</template>

<script>
import SignUpModal from '@/components/modals/SignUpModal'
import Countdown from '@/components/Countdown'
import axios from 'axios'

export default {
  name: 'Home',
  components: { SignUpModal, Countdown },
  data () {
    return {
      totalVTX: 0,
      remainingVTX: 0,
      currentVTXPrice: 0,
      reservedVTX: 0,
      percentReserved: 0,
      roundEnd: '',
      roundEndSeconds: '',
      currencyOptions: [],
      selectedCurrency: 'BTC',
      nextIncrease: '',
      nextIncreaseSeconds: '',
      crowdsaleEnded: false,
      crowdsalePaused: false
    }
  },
  computed: {
    selectedCurrencyRate () {
      try {
        return this.vtxRates[this.selectedCurrency]
      } catch (err) {
        return this.currentVTXPrice
      }
    },
    disableContributeButton () {
      return this.crowdsaleEnded || this.crowdsalePaused
    }
  },
  created () {
    const vm = this
    axios.get('/get-home-stats/').then(response => {
      if (response.data.success) {
        vm.currentVTXPrice = response.data.current_price.toFixed(3)
        vm.roundEnd = response.data.round_end
        vm.roundEndSeconds = response.data.round_end_seconds
        vm.totalVTX = response.data.total_VTX
        vm.reservedVTX = response.data.reserved_VTX
        vm.percentReserved = (vm.reservedVTX / vm.totalVTX) * 100
        vm.remainingVTX = response.data.remaining_VTX
        vm.nextIncrease = response.data.next_increase
        vm.nextIncreaseSeconds = response.data.next_increase_seconds
        vm.vtxRates = response.data.vtx_rates
        Object.keys(vm.vtxRates).map(function (value, index) {
          vm.currencyOptions.push(value)
        })
        vm.crowdsaleEnded = response.data.crowdsale_ended
        vm.crowdsalePaused = response.data.crowdsale_paused
      }
    })
  },
  methods: {
    contributeNow () {
      if (this.$store.state.apiToken) {
        this.$router.push('/contribute')
      } else {
        this.$refs.signUp.$refs.signUpModal.show()
      }
    }
  }
}
</script>

<style scoped>
#home-top {
  padding-bottom: 50px;
  color: white;
}
#home-bottom {
  border-top: 4px solid rgba(30, 37, 48, 0.3);
  padding-top: 30px;
}
</style>
