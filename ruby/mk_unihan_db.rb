#!/usr/bin/ruby

dirname = File.realpath(File.dirname(__FILE__))
#require 'rubygems'
require "bundler/setup"
require dirname + '/include.rb'
require 'zip'


class UnihanReadingDb
  def initialize()
    @type = UnihanType.new
    @chars = Hash.new

    @outdir = File.realpath(File.dirname(__FILE__)) + "/../public/data/"
    #@chars['syms'] = @type.getSyms
    #@chars['data_version'] = '2.1'
  end

  def store2msgpack
    open(@outdir + "unihan.msgpack", "w") do |out|
      out.print @chars.to_msgpack
    end
  end # store2msgpack

  def store2json
    require 'json'
    open(@outdir + "unihan.json", "w:UTF-:") do |out|
      out.print JSON.generate(@chars)
    end
  end # store2json

  def store2db
    require 'tokyocabinet'
    @hdb = TokyoCabinet::HDB.new
    @hdb.open(@outdir + 'unihan.hdb',
		TokyoCabinet::HDB::OWRITER|TokyoCabinet::HDB::OCREAT)
    @hdb.put("data_version", "2.00")

    @chars.each do |char, charval|
      @hdb.put(char, charval.to_msgpack)
      #jstr = JSON.generate(charval)
      #@hdb.put(char, jstr)
    end
    @hdb.close()
  end

  def _set(key, type, val)
    @type.setType(type)
    typeid = @type.to_num
    @chars[key] ||= {}
    unless @chars[key][typeid].nil?
      STDERR.puts "#{char}:#{type} is already registered"
      return
    end
    encdval = val.force_encoding("UTF-8")
    if encdval == val
      @chars[key][typeid] =  encdval
    else
      puts "[#{key}][#{typeid}](#{encdval}) failed to force_encoding"
    end

  end

  def setReading(key, type, val)
    self._set(key, type, val)
  end

  def setVariant(key,type,val)
    self._set(key, type, val)
  end

  def finalize
    t_mandarin = @type.to_num('Mandarin')
    t_cantonese = @type.to_num('Cantonese')
    t_zvar = @type.to_num('ZVariant')
    t_tvar = @type.to_num('TraditionalVariant')
    t_svar = @type.to_num('SimplifiedVariant')
    # fill cantonese unknown reading

    @chars.each do |char, charval|
      next unless charval[t_cantonese].nil?
      [t_zvar, t_tvar, t_svar].each do |variant|
        begin
          nextchar = charval[variant]
          nextval = @chars[nextchar][t_cantonese]
	        next if nextval.nil?
      	  # debug
      	  STDERR.puts "fill cantonese char=#{char} variant=#{variant} nextchar=#{nextchar} nextval=#{nextval}"
      	  charval[t_cantonese] = nextval
      	  break
      	rescue NoMethodError
      	  next
      	end
      end
    end
  end

   def readUnihanReadings(io)
     io.each_line do |line|
       next if line[0] == "#"[0]
       line.chomp!
       next if ! line.match(/^U\+([0-9A-F]+)\s+k([a-zA-Z0-9]+)\s+(.+)$/)
       code, type, value = $1, $2, $3.force_encoding("UTF-8")
       #puts "value=" + value
       #exit
       if code.size < 2
         STDERR.puts "Skip: #{line}"
         next
       end
       key = [code.hex].pack("U*")
       setReading(key, type, value)
     end # io.each_line
   end # readUnihanReadings

   def readUnihanVariants(io)
     io.each_line do |line|
       next if ! line.match(/^U\+([0-9A-F]+)\s+k([a-zA-Z0-9]+)\s+U\+([0-9A-F]+)/)
       k, t, v = [$1.hex].pack("U*"), $2, [$3.hex].pack("U*")
       next if k.nil? or v.nil?
       setVariant(k, t, v)
     end #io.each_line
   end # readUnihanVariants

   def readUnihanDictionaryLikeData(io)
     io.each_line do |line|
       next if ! line.match(/^U\+([0-9A-F]+)\s+k([a-zA-Z0-9]+)\s+(.+)$/)
       k, t, v = [$1.hex].pack("U*"), $2, $3
       next if k.nil? or v.nil?
       setVariant(k, t, v)
     end # io.each_line
   end # readUnihanDictionaryLikeData

   def readUnihanZip(zipfile)
     Zip::InputStream.open(zipfile, 0) do |zs|
       while zsf = zs.get_next_entry
         STDERR.puts "extracting " + zsf.name
         case File.basename(zsf.name)
         when "Unihan_Readings.txt" then
           readUnihanReadings(zsf.get_input_stream)
         when "Unihan_Variants.txt" then
           readUnihanVariants(zsf.get_input_stream)
         when "Unihan_DictionaryLikeData.txt" then
           readUnihanDictionaryLikeData(zsf.get_input_stream)
         end
       end
     end
   end
end

urdb = UnihanReadingDb.new
urdb.readUnihanZip(dirname + "/../data/Unihan.zip")
urdb.finalize
urdb.store2json
urdb.store2msgpack
