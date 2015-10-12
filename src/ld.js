#!/usr/bin/env node

var _ = require('lodash');

var a = {'somePath':['a']};

_.each(a, function(v,k) {
  console.log('V : K : ', v.length,k);
});